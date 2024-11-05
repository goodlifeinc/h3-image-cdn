import { defineEventHandler } from 'h3';
import { createStorage } from 'unstorage';
import fsLiteDriver from 'unstorage/drivers/fs-lite';

const storageFactory = ({ context }) =>
    createStorage({
        driver: fsLiteDriver({
            base: context.config.tempDirPath
        })
    });

export default defineEventHandler({
    handler: (event) => {
        event.context = {
            ...event.context,
            storage: storageFactory(event)
        };
    }
});
