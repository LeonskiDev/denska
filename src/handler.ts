/**
 * A `Handler` deals with the adding and handling middleware functions.
 * 
 * When the `handle` function is called, the `ctx` (`Context`) data begin to
 * flow through each middleware function defined with `use`. For the `ctx` to
 * continue flowing, the current middleware function has to call `next`.
 * 
 * Once the last middleware function is called or when `next` hasn't been
 * called by the current function, the `ctx` will begin to flow back up-stream.
 * This allows for the previous middleware functions to complete.
 */
export class Handler {
  #middleware: Middleware[] = [];

  /**
   * Adds the middleware function to the end of the stack.
   * 
   * `ctx` refers to the persistent data which flows down and back up the
   * middleware stack. This data is then discarded once it is done with.
   * 
   * `next` is a function which when called then calls the next middleware
   * function in the stack, passing on the `ctx`.
   */
  use<Context>(fn: (ctx: Context, next: () => Promise<void>) => Promise<void>) {
    this.#middleware.push(fn);
  }

  /**
   * Begins the flow of `ctx` (`Context`) through the middleware functions.
   * 
   * Full credit for this code goes to the [koajs](https://koaj.com) team who
   * created [koa-compose](https://github.com/koajs/compose). This code is
   * derived from their (tweaked) code.
   */
  async handle<Context>(ctx: Context) {
    let last = -1;

    const dispatch = async (i: number): Promise<void> => {
      if(i <= last) return Promise.reject(new Error("next called multiple times"));

      last = i;
      let fn = this.#middleware[i];

      if(i === this.#middleware.length) fn = async () => {};
      if(!fn) return Promise.resolve();

      try { return Promise.resolve(fn(ctx, dispatch.bind(null, i + 1))); }
      catch(err) { return Promise.reject(err); }
    };

    return dispatch(0);
  }
}

type Middleware = (ctx: any, next: () => Promise<void>) => Promise<void>;