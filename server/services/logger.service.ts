import { Logger } from "@mondaycom/apps-sdk";
import { getContext } from "./context/request-context";

/**
 * This logger provides a simple way to log messages for your app in a project deployed <monday-code/>.
 * Logged messages are accessible via "@mondaycom/apps-cli" https://github.com/mondaycom/monday-code-cli#mapps-codelogs
 * using `$ mapps code:logs`
 * Logs written without this logger may not be accessible via @mondaycom/apps-cli or not get labeled correctly
 * visit https://github.com/mondaycom/apps-sdk#logger for documentation
 */
class MondayLogger {
  private tag: string;

  constructor(tag: string) {
    this.tag = tag;
  }
  info(message: string, options?: Record<string, any>) {
    new Logger(this.tag).info(
      JSON.stringify({ message, tag: this.tag, ...getContext(), ...options })
    );
  }

  warn(message: string, options?: Record<string, any>) {
    new Logger(this.tag).warn(
      JSON.stringify({ message, tag: this.tag, ...getContext(), ...options })
    );
  }

  error(message: string, options?: Record<string, any>) {
    new Logger(this.tag).error(message, { ...getContext(), ...options });
  }

  debug(message: string, options?: Record<string, any>) {
    new Logger(this.tag).debug(
      JSON.stringify({ message, tag: this.tag, ...getContext(), ...options })
    );
  }
}

export default MondayLogger;
