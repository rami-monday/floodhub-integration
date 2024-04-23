import { Storage } from "@mondaycom/apps-sdk";

type Options = {
  previousVersion?: string;
  shared?: boolean;
};
/**
 * key/value storage for monday-code projects
 * This is the way to store customer data for your app
 * key/value based where the key is a string and value can be any serializable type (object, number, string, etc.)
 * compartmentalized based on accountId and app for your specific app which means that data stored for one account will not be accessible from the context of another account
 * @param {string} token - The Monday user token obtained from either OAuth or webhook triggers as a shortLivedToken.
 */
class BaseStorage {
  private storage: Storage;
  prefix: string;
  constructor(token: string) {
    this.storage = new Storage(token);
    this.prefix = "";
  }

  async set(key: string | number, value: any, options?: Options) {
    return await this.storage.set(
      `${this.prefix}${key}`,
      JSON.stringify(value),
      options
    );
  }

  async get(key: string | number, options?: Options) {
    try {
      const res = (await this.storage.get(`${this.prefix}${key}`, options)) as {
        value: any;
      };
      let value;
      if (res?.value) {
        value = JSON.parse(res.value);
      }
      return { ...res, value };
    } catch (e) {
      return { success: false, value: null };
    }
  }

  async delete(key: string | number, options?: Options) {
    return await this.storage.delete(`${this.prefix}${key}`, options);
  }
}

export default BaseStorage;
