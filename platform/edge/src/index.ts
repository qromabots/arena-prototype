import { createMergeableStore } from 'tinybase';
import { createDurableObjectStoragePersister } from 'tinybase/persisters/persister-durable-object-storage';
import {
  WsServerDurableObject,
  getWsServerDurableObjectFetch,
} from 'tinybase/synchronizers/synchronizer-ws-server-durable-object';

/** One Durable Object per drawing room; persists and relays MergeableStore sync. */
export class DrawingRoomDurableObject extends WsServerDurableObject {
  createPersister() {
    return createDurableObjectStoragePersister(
      createMergeableStore(),
      this.ctx.storage,
      'drawing:',
    );
  }
}

export default {
  fetch: getWsServerDurableObjectFetch('DRAWING_ROOMS'),
};
