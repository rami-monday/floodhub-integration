import MondayLogger from "../logger.service";
import mondaySDK from "monday-sdk-js";
import { gql } from "graphql-request";

const logger = new MondayLogger("monday-client");
class MondayClient {
  private token: string | undefined;
  constructor(token?: string) {
    this.token = token;
  }

  private async fetch(query: string, variables?: Record<string, any>) {
    if (!this.token) {
      logger.error("No monday token found");
      throw new Error("No monday token found");
    }
    const monday = mondaySDK();

    try {
      logger.info("Fetching data from monday API", { query, variables });
      monday.setToken(this.token);
      const response = await monday.api(query, { variables });

      if (!response?.data) {
        throw new Error(JSON.stringify(response));
      }

      return response?.data;
    } catch (error) {
      logger.error("Error fetching data from monday API", {
        query,
        variables,
        error,
      });
      throw error;
    }
  }

  public async createItem(
    boardId: string,
    itemName: string,
    columnValues: Record<string, any>
  ) {
    const query = gql`
      mutation createItem(
        $boardId: ID!
        $columnValues: JSON!
        $itemName: String!
      ) {
        create_item(
          board_id: $boardId
          item_name: $itemName
          column_values: $columnValues
          create_labels_if_missing: true
        ) {
          id
        }
      }
    `;
    const variables = {
      boardId,
      columnValues: JSON.stringify(columnValues),
      itemName,
    };

    const result = await this.fetch(query, variables);
    return result;
  }
}

export default MondayClient;
