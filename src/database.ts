import config, { IConfig } from 'config';
import { connect as mongooseConnect, connection, set } from 'mongoose';

const dbConfig: IConfig = config.get('App.database');

export const connect = async (): Promise<void> => {
    set('strictQuery', false);
    await mongooseConnect(dbConfig.get('mongoUrl'));
};

export const close = (): Promise<void> => connection.close();