import { IDateTimeProvider } from "../application/interfaces";

/**
 * 日時取得
 */
export class DateTimeProvider implements IDateTimeProvider {

    /**
     * 現在の日時を取得します
     */
    getCurrentDate(): Date {
        return new Date();
    }
} 