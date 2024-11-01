// taskUtils.js

export const isDeadlinePassed = (deadline) => {
    const taskDeadline = new Date(deadline);
    const today = new Date().setHours(0, 0, 0, 0);
    return taskDeadline.setHours(23, 59, 59, 999) < today;
  };
  
  // Add other helper functions as needed
  