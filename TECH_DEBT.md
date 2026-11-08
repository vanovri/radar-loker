# radar-loker: performance and technical debt

Source crosscheck: 2026-11-08 WIB. Locations refer to the current production files. The unified diffs below are proposals only. Production code has not been changed. No elapsed-time improvement is claimed without measurement.

## 1. Trim equal diff boundaries and widen the LCS cell representation

Location: src/pasal.js:36-73.

The full dynamic-programming matrix uses O(N*M) time and memory and 16-bit cells. Common-prefix/suffix trimming reduces work when edits are local, and Uint32 cells avoid the 65,536 wrap boundary. This remains quadratic for wholly different text. On an equally large untrimmed matrix, 32-bit storage doubles the cell payload rather than reducing it. Trimming repeated tokens can choose a different equally optimal diff alignment; preserve or deliberately revise that presentation contract.

```diff
diff --git a/src/pasal.js b/src/pasal.js
--- a/src/pasal.js
+++ b/src/pasal.js
@@ -36,35 +36,52 @@
 export function diffWords(oldStr, newStr) {
   const a = tokenize(oldStr);
   const b = tokenize(newStr);
-  const n = a.length;
-  const m = b.length;
-  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
+  let start = 0;
+  while (start < a.length && start < b.length && a[start].toLowerCase() === b[start].toLowerCase()) {
+    start++;
+  }
+  let endA = a.length;
+  let endB = b.length;
+  while (endA > start && endB > start && a[endA - 1].toLowerCase() === b[endB - 1].toLowerCase()) {
+    endA--;
+    endB--;
+  }
+
+  const ops = [];
+  for (let k = 0; k < start; k++) ops.push({ type: 'same', text: b[k] });
+
+  const n = endA - start;
+  const m = endB - start;
+  const stride = m + 1;
+  const dp = new Uint32Array((n + 1) * stride);
 
   for (let i = n - 1; i >= 0; i--) {
     for (let j = m - 1; j >= 0; j--) {
-      if (a[i].toLowerCase() === b[j].toLowerCase()) {
-        dp[i][j] = dp[i + 1][j + 1] + 1;
+      if (a[start + i].toLowerCase() === b[start + j].toLowerCase()) {
+        dp[i * stride + j] = dp[(i + 1) * stride + (j + 1)] + 1;
       } else {
-        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
+        const down = dp[(i + 1) * stride + j];
+        const right = dp[i * stride + (j + 1)];
+        dp[i * stride + j] = down >= right ? down : right;
       }
     }
   }
 
-  const ops = [];
   let i = 0;
   let j = 0;
   while (i < n && j < m) {
-    if (a[i].toLowerCase() === b[j].toLowerCase()) {
-      ops.push({ type: 'same', text: b[j] });
+    if (a[start + i].toLowerCase() === b[start + j].toLowerCase()) {
+      ops.push({ type: 'same', text: b[start + j] });
       i++;
       j++;
-    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
-      ops.push({ type: 'del', text: a[i++] });
+    } else if (dp[(i + 1) * stride + j] >= dp[i * stride + (j + 1)]) {
+      ops.push({ type: 'del', text: a[start + i++] });
     } else {
-      ops.push({ type: 'ins', text: b[j++] });
+      ops.push({ type: 'ins', text: b[start + j++] });
     }
   }
-  while (i < n) ops.push({ type: 'del', text: a[i++] });
-  while (j < m) ops.push({ type: 'ins', text: b[j++] });
+  while (i < n) ops.push({ type: 'del', text: a[start + i++] });
+  while (j < m) ops.push({ type: 'ins', text: b[start + j++] });
+  for (let k = endB; k < b.length; k++) ops.push({ type: 'same', text: b[k] });
   return ops;
 }
```

Validation: Check minimal edit counts, reconstruction of both inputs, Unicode/case behavior and ambiguous repeated-token alignments. Compare large local edits and wholly different text with memory limits. Measure actual latency and peak memory without an invented 2 ms target. A separate input budget or worker-based algorithm is needed for unbounded browser inputs.

## 2. Correct generated masks, mock register byte order and ESP-IDF write example

Location: src/datasheet.js:118-119; src/datasheet.js:193-198; src/datasheet.js:286.

JavaScript bitwise shifts truncate to signed 32 bits, so wider mask construction must use BigInt. The 16-bit mock ID must use the same big-endian byte order as read_reg. The ESP-IDF adapter is emitted as an example inside a comment; adding its missing write callback completes that example and does not automatically wire a runtime driver. Field/register validation is still required for unsupported or negative widths.

```diff
diff --git a/src/datasheet.js b/src/datasheet.js
--- a/src/datasheet.js
+++ b/src/datasheet.js
@@ -115,8 +115,9 @@
   const fieldMacros = spec.registers
     .flatMap((r) =>
       (r.fields || []).map((f) => {
-        const mask = ((1 << f.width) - 1) << f.bit;
-        const hexMask = '0x' + (mask >>> 0).toString(16).toUpperCase().padStart(spec.regWidth / 4, '0') + 'U';
+        const regLimit = (1n << BigInt(spec.regWidth)) - 1n;
+        const mask = (((1n << BigInt(f.width)) - 1n) << BigInt(f.bit)) & regLimit;
+        const hexMask = '0x' + mask.toString(16).toUpperCase().padStart(spec.regWidth / 4, '0') + 'U';
         return [
           `#define ${P}_${r.name}_${f.name}_POS   (${f.bit}U)`,
           `#define ${P}_${r.name}_${f.name}_MASK  (${hexMask})`,
@@ -194,6 +195,13 @@
 int ${p}_esp_i2c_read(uint8_t addr, uint8_t reg, uint8_t *buf, uint16_t len, void *ctx) {
     i2c_port_t port = (i2c_port_t)(uintptr_t)ctx;
     return (i2c_master_write_read_device(port, addr, &reg, 1, buf, len, pdMS_TO_TICKS(100)) == ESP_OK) ? 0 : -1;
+}
+int ${p}_esp_i2c_write(uint8_t addr, uint8_t reg, const uint8_t *buf, uint16_t len, void *ctx) {
+    i2c_port_t port = (i2c_port_t)(uintptr_t)ctx;
+    uint8_t frame[1 + 2] = { reg, 0, 0 };
+    if (len > 2U) return -1;
+    for (uint16_t i = 0; i < len; i++) frame[1U + i] = buf[i];
+    return (i2c_master_write_to_device(port, addr, frame, (size_t)(1U + len), pdMS_TO_TICKS(100)) == ESP_OK) ? 0 : -1;
 }
 */`;
 
@@ -283,6 +291,8 @@
 
 int main(void) {
     memset(mock_regs, 0, sizeof(mock_regs));
-${spec.idReg ? `    mock_regs[${P}_REG_${spec.idReg.name}][0] = ${spec.idReg.expected}U;` : ''}
+${spec.idReg ? (bytes === 2
+  ? `    mock_regs[${P}_REG_${spec.idReg.name}][0] = (uint8_t)(((${spec.idReg.expected}U) >> 8U) & 0xFFU);\n    mock_regs[${P}_REG_${spec.idReg.name}][1] = (uint8_t)((${spec.idReg.expected}U) & 0xFFU);`
+  : `    mock_regs[${P}_REG_${spec.idReg.name}][0] = ${spec.idReg.expected}U;`) : ''}
     ${p}_dev_t dev;
     assert(${p}_init(&dev, ${P}_I2C_ADDR_7BIT, mock_read, mock_write, NULL) == ${P}_OK);
```

Validation: Generate 8/16-bit fixtures and compile/run their emitted mock C tests with warnings as errors. Verify 0x5449 produces bytes 0x54,0x49 and boundary field masks. Compile ESP-IDF adapter examples against the intended SDK before claiming platform readiness.

## 3. Use the actual staged category and preserve TLS certificate checks

Location: run_pipeline_2026_11_04.py:508-513; run_pipeline_2026_11_04.py:1099-1104.

The historical pipeline counts D_NEW_RADAR_TARGET while the audit builder emits C_READY_TO_APPLY_2026_11_04. Count the actual category, without freezing a historical expected total. The curl fallback also disables certificate verification with -k; remove insecure certificate and revocation bypass options. Transport errors should remain errors rather than successful portal evidence.

```diff
diff --git a/run_pipeline_2026_11_04.py b/run_pipeline_2026_11_04.py
--- a/run_pipeline_2026_11_04.py
+++ b/run_pipeline_2026_11_04.py
@@ -506,7 +506,7 @@
         import subprocess
         try:
             r = subprocess.run(
-                ["curl.exe", "-s", "-L", "-k", "--ssl-no-revoke", "-o", "NUL", "-w", "%{http_code}|%{url_effective}", "-A", "Mozilla/5.0", url],
+                ["curl.exe", "-s", "-L", "-o", "NUL", "-w", "%{http_code}|%{url_effective}", "-A", "Mozilla/5.0", url],
                 capture_output=True,
                 text=True,
                 timeout=timeout,
@@ -1100,7 +1100,9 @@
     if "summary_counts" in ledger:
         ledger["summary_counts"]["sent_verified_count"] = sum(1 for a in apps if a.get("category") == "A_SENT_VERIFIED")
         ledger["summary_counts"]["total_confirmed_submissions"] = ledger["summary_counts"]["sent_verified_count"]
-        ledger["summary_counts"]["new_radar_targets_count"] = sum(1 for a in apps if a.get("category") == "D_NEW_RADAR_TARGET")
+        ledger["summary_counts"]["new_radar_targets_count"] = sum(
+            1 for a in apps if a.get("category") == "C_READY_TO_APPLY_2026_11_04"
+        )
 
     ledger["execution_pipeline_2026_11_04"] = {
         "executed_at_wib": NOW_WIB.isoformat(),
```

Validation: Use isolated ledger fixtures and stub transport calls. Assert the staged count equals the actual number of matching rows and certificate failure cannot be classified as a successful probe. Do not replay the full recruitment pipeline or send anything for this test.

## 4. Parse dotted thousand notation consistently in ribu-denominated salary values

Location: src/rules.js:218-220.

4.500 rb currently becomes 4,500 rupiah because parseFloat treats the dot as a decimal point before multiplying by 1,000. Match grouped thousands explicitly, while preserving decimal-comma handling. This chooses the Indonesian grouping interpretation for ambiguous rb input and should be documented in parser fixtures.

```diff
diff --git a/src/rules.js b/src/rules.js
--- a/src/rules.js
+++ b/src/rules.js
@@ -216,7 +216,8 @@
     return Number.isFinite(v) ? Math.round(v * 1_000_000) : NaN;
   }
   if (u === 'rb' || u === 'ribu' || u === 'k') {
-    const v = parseFloat(n.replace(',', '.'));
+    const cleaned = /^\d{1,3}(?:\.\d{3})+$/.test(n) ? n.replace(/\./g, '') : n.replace(',', '.');
+    const v = parseFloat(cleaned);
     return Number.isFinite(v) ? Math.round(v * 1_000) : NaN;
   }
   // Rp 4.500.000 / 4,500,000 / 4500000
```

Validation: Test 4.500 rb, 1.800 ribu, 4,5 juta, plain rupiah values, ranges and ambiguous decimal/grouping strings. Verify downstream found/floor/low-salary behavior with synthetic ads.

## 5. Bound batch file I/O concurrency while preserving file order

Location: scripts/scan.mjs:13-18.

File reads are serial today. Groups of at most eight Promise operations overlap disk I/O without opening every file simultaneously. Analyze remains synchronous and results stay in readdir order within and between batches. Empty results do not currently produce NaN percentages because the frequency map is empty and its map callback never executes; the previous empty-input defect claim is withdrawn.

```diff
diff --git a/scripts/scan.mjs b/scripts/scan.mjs
--- a/scripts/scan.mjs
+++ b/scripts/scan.mjs
@@ -12,9 +12,12 @@
 
 const files = (await readdir(dir)).filter((f) => f.endsWith('.txt'));
 const results = [];
-for (const f of files) {
-  const r = analyze(await readFile(join(dir, f), 'utf8'));
-  results.push({ file: basename(f), score: r.score, level: r.level.label, flags: r.findings.map((x) => x.id) });
+for (let start = 0; start < files.length; start += 8) {
+  const batch = await Promise.all(files.slice(start, start + 8).map(async (f) => {
+    const r = analyze(await readFile(join(dir, f), 'utf8'));
+    return { file: basename(f), score: r.score, level: r.level.label, flags: r.findings.map((x) => x.id) };
+  }));
+  results.push(...batch);
 }
 
 if (process.argv.includes('--json')) {
```

Validation: Compare serial/batched JSON with synthetic folders containing zero, one and more than eight files. Stub read failures and verify a clear nonzero exit. Measure I/O benefit on the actual storage medium.

## 6. Close CSV input and launch the clipboard executable directly

Location: scripts/build_data.py:70; execution-pack-2026-11-04/autofill_helper.py:32-34; run_pipeline_2026_11_04.py:870-872.

The CSV reader leaves an explicitly opened file unmanaged. A context manager closes it even if parsing fails. The clipboard helper invokes a Windows shell unnecessarily. Update both the checked-in helper and its generator template so regeneration preserves direct clip.exe execution.

```diff
diff --git a/scripts/build_data.py b/scripts/build_data.py
--- a/scripts/build_data.py
+++ b/scripts/build_data.py
@@ -67,7 +67,8 @@
     ap.add_argument("--with-roles", action="store_true", help="Sertakan daftar posisi+perusahaan (jangan dipublikasikan)")
     args = ap.parse_args()
 
-    rows = list(csv.DictReader(open(args.csv, encoding="utf-8-sig")))
+    with open(args.csv, encoding="utf-8-sig", newline="") as handle:
+        rows = list(csv.DictReader(handle))
     if not rows:
         raise SystemExit("CSV kosong")
 
diff --git a/execution-pack-2026-11-04/autofill_helper.py b/execution-pack-2026-11-04/autofill_helper.py
--- a/execution-pack-2026-11-04/autofill_helper.py
+++ b/execution-pack-2026-11-04/autofill_helper.py
@@ -30,7 +30,7 @@
 
 
 def copy_to_clipboard(text: str) -> None:
-    proc = subprocess.Popen(["clip"], stdin=subprocess.PIPE, shell=True)
+    proc = subprocess.Popen(["clip.exe"], stdin=subprocess.PIPE, shell=False)
     proc.communicate(input=text.encode("utf-16-le"))
 
 
diff --git a/run_pipeline_2026_11_04.py b/run_pipeline_2026_11_04.py
--- a/run_pipeline_2026_11_04.py
+++ b/run_pipeline_2026_11_04.py
@@ -868,5 +868,5 @@
 
 
 def copy_to_clipboard(text: str) -> None:
-    proc = subprocess.Popen(["clip"], stdin=subprocess.PIPE, shell=True)
+    proc = subprocess.Popen(["clip.exe"], stdin=subprocess.PIPE, shell=False)
     proc.communicate(input=text.encode("utf-16-le"))
```

Validation: Build aggregate data from a temporary synthetic CSV under ResourceWarning checks. Stub Popen and verify the direct executable, shell=False and UTF-16LE stdin. Do not open a real portal, mail client or clipboard in automated tests.

## Crosscheck decisions

The earlier role-family reorder was withdrawn: placing broad admin/operation terms before IT would misclassify roles such as IT Operations. Classification collisions remain a taxonomy decision requiring explicit fixtures. Legal explanations, wage tables, vacancy status and historical submission counts are source snapshots, not verified-current advice or live state. This review did not run recruitment or messaging scripts.
