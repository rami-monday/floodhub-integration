export const errorControllerWrapper = (controller: any) => {
  return async (req: any, res: any, next: any) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
