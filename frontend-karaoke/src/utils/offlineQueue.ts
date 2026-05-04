const KEY = "offline_queue";

export type QueueItem = {
  id: number;
  action: string;
  time: number;
};

export function addToQueue(item: QueueItem) {
  const queue = JSON.parse(localStorage.getItem(KEY) || "[]");
  queue.push(item);
  localStorage.setItem(KEY, JSON.stringify(queue));
}

export function getQueue(): QueueItem[] {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function clearQueue() {
  localStorage.removeItem(KEY);
}