import BaseStorage from "./base-storage";

class MondayItemLock extends BaseStorage {
  constructor(token: string) {
    super(token);
    this.prefix = "monday_item_lock_";
  }

  async lockForecast(
    boardId: number,
    items: {
      gaugeId: string;
      startTime: string;
      endTime: string;
    }[]
  ) {
    const currentLocks = await this.getLockedItems(boardId);

    const newLocks = [...currentLocks, ...items];

    return await this.set(boardId, newLocks);
  }

  async getLockedItems(boardId: number): Promise<
    {
      gaugeId: string;
      startTime: string;
      endTime: string;
    }[]
  > {
    const lockedItems = (await this.get(boardId))?.value;

    return Array.isArray(lockedItems) ? lockedItems : [];
  }
}

export default MondayItemLock;
