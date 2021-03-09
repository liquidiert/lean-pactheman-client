import { ErrorMsg } from '../models/pactheman.models';
import BebopHandler from './bebopHandler';

export default class ErrorMsgHandler implements BebopHandler {
    handleMessage(sender: any, message: any): void {
        message = ErrorMsg.decode(message);
        console.log(`Received ${message.errorMessage} violation`)
    }
}