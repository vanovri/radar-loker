// Datasheet Register Map → C Driver Generator (STM32 HAL & ESP32) + Unit Test.

export const SENSOR_PRESETS = {
  ina219: {
    name: 'INA219',
    desc: 'Bidirectional Current/Power Monitor (I2C)',
    bus: 'I2C',
    i2cAddr: '0x40',
    regWidth: 16,
    endian: 'big',
    registers: [
      { name: 'CONFIG', addr: '0x00', rw: 'RW', reset: '0x399F', desc: 'Configuration register', fields: [{ name: 'RST', bit: 15, width: 1 }, { name: 'BRNG', bit: 13, width: 1 }, { name: 'PGA', bit: 11, width: 2 }, { name: 'MODE', bit: 0, width: 3 }] },
      { name: 'SHUNT_VOLTAGE', addr: '0x01', rw: 'R', reset: '0x0000', desc: 'Shunt voltage measurement', fields: [] },
      { name: 'BUS_VOLTAGE', addr: '0x02', rw: 'R', reset: '0x0000', desc: 'Bus voltage measurement', fields: [{ name: 'BD', bit: 3, width: 13 }, { name: 'CNVR', bit: 1, width: 1 }, { name: 'OVF', bit: 0, width: 1 }] },
      { name: 'POWER', addr: '0x03', rw: 'R', reset: '0x0000', desc: 'Power measurement', fields: [] },
      { name: 'CURRENT', addr: '0x04', rw: 'R', reset: '0x0000', desc: 'Current measurement', fields: [] },
      { name: 'CALIBRATION', addr: '0x05', rw: 'RW', reset: '0x0000', desc: 'Calibration register', fields: [] },
    ],
  },
  mpu6050: {
    name: 'MPU6050',
    desc: '6-Axis Accelerometer & Gyroscope IMU (I2C)',
    bus: 'I2C',
    i2cAddr: '0x68',
    regWidth: 8,
    endian: 'big',
    idReg: { name: 'WHO_AM_I', addr: '0x75', expected: '0x68' },
    registers: [
      { name: 'SMPLRT_DIV', addr: '0x19', rw: 'RW', reset: '0x00', desc: 'Sample rate divider', fields: [] },
      { name: 'CONFIG', addr: '0x1A', rw: 'RW', reset: '0x00', desc: 'DLPF configuration', fields: [{ name: 'DLPF_CFG', bit: 0, width: 3 }] },
      { name: 'GYRO_CONFIG', addr: '0x1B', rw: 'RW', reset: '0x00', desc: 'Gyroscope full-scale range', fields: [{ name: 'FS_SEL', bit: 3, width: 2 }] },
      { name: 'ACCEL_CONFIG', addr: '0x1C', rw: 'RW', reset: '0x00', desc: 'Accelerometer full-scale range', fields: [{ name: 'AFS_SEL', bit: 3, width: 2 }] },
      { name: 'ACCEL_XOUT_H', addr: '0x3B', rw: 'R', reset: '0x00', desc: 'Accel X high byte', fields: [] },
      { name: 'PWR_MGMT_1', addr: '0x6B', rw: 'RW', reset: '0x40', desc: 'Power management 1', fields: [{ name: 'DEVICE_RESET', bit: 7, width: 1 }, { name: 'SLEEP', bit: 6, width: 1 }, { name: 'CLKSEL', bit: 0, width: 3 }] },
      { name: 'WHO_AM_I', addr: '0x75', rw: 'R', reset: '0x68', desc: 'Device ID register', fields: [] },
    ],
  },
  bmp280: {
    name: 'BMP280',
    desc: 'Barometric Pressure & Temperature Sensor (I2C)',
    bus: 'I2C',
    i2cAddr: '0x76',
    regWidth: 8,
    endian: 'big',
    idReg: { name: 'ID', addr: '0xD0', expected: '0x58' },
    registers: [
      { name: 'ID', addr: '0xD0', rw: 'R', reset: '0x58', desc: 'Chip identification number', fields: [] },
      { name: 'RESET', addr: '0xE0', rw: 'W', reset: '0x00', desc: 'Soft reset register (write 0xB6)', fields: [] },
      { name: 'STATUS', addr: '0xF3', rw: 'R', reset: '0x00', desc: 'Conversion status', fields: [{ name: 'MEASURING', bit: 3, width: 1 }, { name: 'IM_UPDATE', bit: 0, width: 1 }] },
      { name: 'CTRL_MEAS', addr: '0xF4', rw: 'RW', reset: '0x00', desc: 'Oversampling and power mode', fields: [{ name: 'OSRS_T', bit: 5, width: 3 }, { name: 'OSRS_P', bit: 2, width: 3 }, { name: 'MODE', bit: 0, width: 2 }] },
      { name: 'CONFIG', addr: '0xF5', rw: 'RW', reset: '0x00', desc: 'Standby time and IIR filter', fields: [{ name: 'T_SB', bit: 5, width: 3 }, { name: 'FILTER', bit: 2, width: 3 }] },
      { name: 'PRESS_MSB', addr: '0xF7', rw: 'R', reset: '0x80', desc: 'Pressure MSB data', fields: [] },
    ],
  },
};

// Parser format teks ringkas:
// Baris 1: NAME=INA219 BUS=I2C ADDR=0x40 WIDTH=16
// Baris berikutnya: REG_NAME 0x00 RW 0x399F [FIELD:bit:width,...] # Deskripsi
export function parseSpecText(text) {
  const lines = String(text || '').split(/\n+/).map((l) => l.trim()).filter((l) => l && !l.startsWith('//'));
  const spec = { name: 'CUSTOM_DEV', desc: 'Custom Sensor Driver', bus: 'I2C', i2cAddr: '0x40', regWidth: 8, endian: 'big', registers: [] };

  for (const line of lines) {
    if (/^NAME=/i.test(line)) {
      const kv = Object.fromEntries(line.split(/\s+/).map((p) => p.split('=')));
      if (kv.NAME) spec.name = kv.NAME.toUpperCase().replace(/[^A-Z0-9_]/g, '');
      if (kv.BUS) spec.bus = kv.BUS.toUpperCase();
      if (kv.ADDR) spec.i2cAddr = kv.ADDR;
      if (kv.WIDTH) spec.regWidth = Number(kv.WIDTH) === 16 ? 16 : 8;
      continue;
    }
    const [mainPart, commentPart] = line.split('#');
    const tokens = mainPart.trim().split(/\s+/);
    if (tokens.length < 3) continue;
    const [rName, rAddr, rRw = 'RW', rReset = '0x00', rFields = ''] = tokens;
    const fields = rFields
      .split(',')
      .filter((f) => f.includes(':'))
      .map((f) => {
        const [fn, bit, width = '1'] = f.split(':');
        return { name: fn.toUpperCase().replace(/[^A-Z0-9_]/g, ''), bit: Number(bit) || 0, width: Number(width) || 1 };
      });
    spec.registers.push({
      name: rName.toUpperCase().replace(/[^A-Z0-9_]/g, ''),
      addr: rAddr,
      rw: rRw.toUpperCase(),
      reset: rReset,
      desc: (commentPart || rName).trim(),
      fields,
    });
  }
  return spec;
}

export function specToText(spec) {
  const header = `NAME=${spec.name} BUS=${spec.bus} ADDR=${spec.i2cAddr} WIDTH=${spec.regWidth}`;
  const rows = spec.registers.map((r) => {
    const fStr = (r.fields || []).map((f) => `${f.name}:${f.bit}:${f.width}`).join(',') || '-';
    return `${r.name.padEnd(15)} ${r.addr}  ${r.rw.padEnd(2)}  ${r.reset}  ${fStr.padEnd(28)} # ${r.desc}`;
  });
  return [header, ...rows].join('\n');
}

export function generateDriver(spec, platform = 'stm32') {
  const P = spec.name.toUpperCase();
  const p = spec.name.toLowerCase();
  const valType = spec.regWidth === 16 ? 'uint16_t' : 'uint8_t';
  const bytes = spec.regWidth === 16 ? 2 : 1;

  const regMacros = spec.registers
    .map((r) => `#define ${P}_REG_${r.name.padEnd(18)} (${r.addr}U) /* ${r.desc} (${r.rw}, reset ${r.reset}) */`)
    .join('\n');

  const fieldMacros = spec.registers
    .flatMap((r) =>
      (r.fields || []).map((f) => {
        const mask = ((1 << f.width) - 1) << f.bit;
        const hexMask = '0x' + (mask >>> 0).toString(16).toUpperCase().padStart(spec.regWidth / 4, '0') + 'U';
        return [
          `#define ${P}_${r.name}_${f.name}_POS   (${f.bit}U)`,
          `#define ${P}_${r.name}_${f.name}_MASK  (${hexMask})`,
          `#define ${P}_GET_${r.name}_${f.name}(val) (((val) & ${P}_${r.name}_${f.name}_MASK) >> ${P}_${r.name}_${f.name}_POS)`,
        ].join('\n');
      }),
    )
    .join('\n');

  const header = `/**
 * @file ${p}.h
 * @brief Auto-generated C driver header for ${P} (${spec.desc})
 * @note Bus: ${spec.bus} | Address: ${spec.i2cAddr} | Register width: ${spec.regWidth}-bit
 */
#ifndef ${P}_DRIVER_H
#define ${P}_DRIVER_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>
#include <stdbool.h>

#define ${P}_I2C_ADDR_7BIT        (${spec.i2cAddr}U)
#define ${P}_I2C_ADDR_8BIT        ((${spec.i2cAddr}U) << 1U)

/* Register Map */
${regMacros}

/* Bitfield Masks & Macros */
${fieldMacros || '/* No bitfields defined */'}

typedef enum {
    ${P}_OK = 0,
    ${P}_ERR_NULL = -1,
    ${P}_ERR_IO = -2,
    ${P}_ERR_ID = -3
} ${p}_status_t;

typedef int (*${p}_read_fn)(uint8_t dev_addr, uint8_t reg_addr, uint8_t *data, uint16_t len, void *ctx);
typedef int (*${p}_write_fn)(uint8_t dev_addr, uint8_t reg_addr, const uint8_t *data, uint16_t len, void *ctx);

typedef struct {
    uint8_t dev_addr;
    ${p}_read_fn read;
    ${p}_write_fn write;
    void *ctx;
} ${p}_dev_t;

${p}_status_t ${p}_init(${p}_dev_t *dev, uint8_t addr_7bit, ${p}_read_fn read_fn, ${p}_write_fn write_fn, void *ctx);
${p}_status_t ${p}_read_reg(const ${p}_dev_t *dev, uint8_t reg, ${valType} *out_val);
${p}_status_t ${p}_write_reg(const ${p}_dev_t *dev, uint8_t reg, ${valType} val);

#ifdef __cplusplus
}
#endif

#endif /* ${P}_DRIVER_H */
`;

  const halSnippet =
    platform === 'stm32'
      ? `/* STM32 HAL I2C Wrapper Example (pass &hi2c1 as ctx):
int ${p}_stm32_i2c_read(uint8_t addr, uint8_t reg, uint8_t *buf, uint16_t len, void *ctx) {
    I2C_HandleTypeDef *hi2c = (I2C_HandleTypeDef *)ctx;
    return (HAL_I2C_Mem_Read(hi2c, (uint16_t)(addr << 1U), reg, I2C_MEMADD_SIZE_8BIT, buf, len, 100U) == HAL_OK) ? 0 : -1;
}
int ${p}_stm32_i2c_write(uint8_t addr, uint8_t reg, const uint8_t *buf, uint16_t len, void *ctx) {
    I2C_HandleTypeDef *hi2c = (I2C_HandleTypeDef *)ctx;
    return (HAL_I2C_Mem_Write(hi2c, (uint16_t)(addr << 1U), reg, I2C_MEMADD_SIZE_8BIT, (uint8_t *)buf, len, 100U) == HAL_OK) ? 0 : -1;
}
*/`
      : `/* ESP-IDF I2C Wrapper Example:
int ${p}_esp_i2c_read(uint8_t addr, uint8_t reg, uint8_t *buf, uint16_t len, void *ctx) {
    i2c_port_t port = (i2c_port_t)(uintptr_t)ctx;
    return (i2c_master_write_read_device(port, addr, &reg, 1, buf, len, pdMS_TO_TICKS(100)) == ESP_OK) ? 0 : -1;
}
*/`;

  const idCheck = spec.idReg
    ? `    ${valType} chip_id = 0U;
    if (${p}_read_reg(dev, ${P}_REG_${spec.idReg.name}, &chip_id) != ${P}_OK) {
        return ${P}_ERR_IO;
    }
    if (chip_id != (${spec.idReg.expected}U)) {
        return ${P}_ERR_ID;
    }`
    : `    /* Probe first readable register */
    ${valType} probe = 0U;
    if (${p}_read_reg(dev, ${P}_REG_${spec.registers[0]?.name || 'CONFIG'}, &probe) != ${P}_OK) {
        return ${P}_ERR_IO;
    }`;

  const source = `/**
 * @file ${p}.c
 * @brief Auto-generated C driver implementation for ${P}
 */
#include "${p}.h"
#include <stddef.h>

${halSnippet}

${p}_status_t ${p}_init(${p}_dev_t *dev, uint8_t addr_7bit, ${p}_read_fn read_fn, ${p}_write_fn write_fn, void *ctx) {
    if (dev == NULL || read_fn == NULL || write_fn == NULL) {
        return ${P}_ERR_NULL;
    }
    dev->dev_addr = (addr_7bit != 0U) ? addr_7bit : ${P}_I2C_ADDR_7BIT;
    dev->read = read_fn;
    dev->write = write_fn;
    dev->ctx = ctx;

${idCheck}
    return ${P}_OK;
}

${p}_status_t ${p}_read_reg(const ${p}_dev_t *dev, uint8_t reg, ${valType} *out_val) {
    if (dev == NULL || dev->read == NULL || out_val == NULL) {
        return ${P}_ERR_NULL;
    }
    uint8_t raw[${bytes}] = {0};
    if (dev->read(dev->dev_addr, reg, raw, ${bytes}U, dev->ctx) != 0) {
        return ${P}_ERR_IO;
    }
${bytes === 2 ? '    *out_val = (uint16_t)(((uint16_t)raw[0] << 8U) | (uint16_t)raw[1]);' : '    *out_val = raw[0];'}
    return ${P}_OK;
}

${p}_status_t ${p}_write_reg(const ${p}_dev_t *dev, uint8_t reg, ${valType} val) {
    if (dev == NULL || dev->write == NULL) {
        return ${P}_ERR_NULL;
    }
${bytes === 2 ? '    uint8_t raw[2] = { (uint8_t)((val >> 8U) & 0xFFU), (uint8_t)(val & 0xFFU) };' : '    uint8_t raw[1] = { val };'}
    if (dev->write(dev->dev_addr, reg, raw, ${bytes}U, dev->ctx) != 0) {
        return ${P}_ERR_IO;
    }
    return ${P}_OK;
}
`;

  const firstRw = spec.registers.find((r) => r.rw.includes('W')) || spec.registers[0];
  const testCode = `/**
 * @file test_${p}.c
 * @brief Self-contained mock bus unit test for ${P} driver
 */
#include <assert.h>
#include <string.h>
#include <stdio.h>
#include "${p}.h"

static uint8_t mock_regs[256][${bytes}];

static int mock_read(uint8_t addr, uint8_t reg, uint8_t *data, uint16_t len, void *ctx) {
    (void)addr; (void)ctx;
    memcpy(data, mock_regs[reg], len);
    return 0;
}

static int mock_write(uint8_t addr, uint8_t reg, const uint8_t *data, uint16_t len, void *ctx) {
    (void)addr; (void)ctx;
    memcpy(mock_regs[reg], data, len);
    return 0;
}

int main(void) {
    memset(mock_regs, 0, sizeof(mock_regs));
${spec.idReg ? `    mock_regs[${P}_REG_${spec.idReg.name}][0] = ${spec.idReg.expected}U;` : ''}
    ${p}_dev_t dev;
    assert(${p}_init(&dev, ${P}_I2C_ADDR_7BIT, mock_read, mock_write, NULL) == ${P}_OK);

    /* Test register write/read roundtrip on ${firstRw.name} */
    const ${valType} expected = ${firstRw.reset === '0x00' || firstRw.reset === '0x0000' ? (bytes === 2 ? '0x1234U' : '0x5AU') : firstRw.reset + 'U'};
    assert(${p}_write_reg(&dev, ${P}_REG_${firstRw.name}, expected) == ${P}_OK);
    ${valType} actual = 0U;
    assert(${p}_read_reg(&dev, ${P}_REG_${firstRw.name}, &actual) == ${P}_OK);
    assert(actual == expected);

    printf("[PASS] ${P} driver unit tests succeeded.\\n");
    return 0;
}
`;

  return { header, source, test: testCode, fileBase: p };
}
