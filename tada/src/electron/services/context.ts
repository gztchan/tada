import { Context } from "../context";

export class ContextService {
  protected  context: Context | null = null;

  setContext(context: Context) {
    this.context = context;
  }

  getContext() {
    return this.context;
  }
}