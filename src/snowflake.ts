/** https://discord.com/developers/docs/reference#snowflakes-snowflake-id-format-structure-left-to-right */
const EPOCH = 1420070400000;
// this is the global increment
let INCREMENT = 0;

/**
 * A `Snowflake` is a format for uniquely identifiable descriptors (IDs).
 * 
 * Discord uses them to ensure that all IDs across Discord are unique, except
 * in some scenarios in which child objects share their parents ID.
 * 
 * Since `Snowflake`s are 64 bits in size, they are sent and received as a
 * string to prevent overflows.
 * 
 * [Discord Docs](https://discord.com/developers/docs/reference#snowflakes)
 */
export class Snowflake {
  /** Milliseconds since Discord Epoch, the first second of 2015 or 1420070400000. */
  #timestamp?: Date;
  #worker_id?: number;
  #process_id?: number;
  /** For every ID that is generated on that process, this number is incremented. */
  #increment?: number;

  /** The raw `Snowflake` as a bigint.  */
  #raw: bigint;

  constructor(snowflake: string | number | bigint | SnowflakeOptions = {}) {
    // SnowflakeOptions
    if(typeof(snowflake) !== "string" && typeof(snowflake) !== "number" && typeof(snowflake) !== "bigint") {
      if(INCREMENT >= 0xfff) INCREMENT = 0;

      this.#timestamp = snowflake?.timestamp ?? new Date();
      this.#worker_id = snowflake?.worker_id ?? 0;
      this.#process_id = snowflake?.process_id ?? 1;
      this.#increment = snowflake?.increment ??  INCREMENT++;

      this.#raw = BigInt(this.#timestamp.valueOf() - EPOCH) << 22n;
      this.#raw |= BigInt(this.#worker_id) & 0x3e0000n;
      this.#raw |= BigInt(this.#process_id) & 0x1f000n;
      this.#raw |= BigInt(this.#increment);
    }
    // string | number | bigint
    else this.#raw = BigInt(snowflake);
  }

  /** Gets the `timestamp` of the `Snowflake`, lazily calculating it if needed. */
  get timestamp(): Date {
    if(!this.#timestamp) this.#timestamp = new Date(Number(this.#raw >> 22n) + EPOCH);
    return this.#timestamp;
  }
  /** Gets the `workder_id` of the `Snowflake`, lazily calculating it if needed. */
  get worker_id(): number {
    if(!this.#worker_id) this.#worker_id = Number((this.#raw & 0x3e0000n) >> 17n);
    return this.#worker_id;
  }
  /** Gets the `process_id` of the `Snowflake`, lazily calculating it if needed. */
  get process_id(): number {
    if(!this.#process_id) this.#process_id = Number((this.#raw & 0x1f000n) >> 12n);
    return this.#process_id;
  }
  /** Gets the `increment` of the `Snowflake`, lazily calculating it if needed. */
  get increment(): number {
    if(!this.#increment) this.#increment = Number(this.#raw & 0xfffn);
    return this.#increment;
  }
  /** Gets the `raw` data of the `Snowflake`. */
  get raw(): bigint {
    return this.#raw;
  }

  /** Coverts the `Snowflake` into a string or bigint depending on the hint. */
  [Symbol.toPrimitive](hint: string): bigint | string {
    if(hint === "number") return this.#raw;
    else return `${this.#raw}`;
  }
}

/** Options used when creating a `Snowflake` from its base components. */
export interface SnowflakeOptions {
  /** Milliseconds since Discord Epoch, the first second of 2015 or 1420070400000. */
  timestamp?: Date,
  worker_id?: number,
  process_id?: number,
  /** For every ID that is generated on that process, this number is incremented. */
  increment?: number
}