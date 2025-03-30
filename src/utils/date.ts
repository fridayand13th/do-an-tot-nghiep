import { Op } from "sequelize";
import { ErrorHelper } from "src/helpers/error.utils";
import { VALIDATE_DATE_MESSAGE } from "src/common/messages/common.message";
import moment from "moment-timezone";

export function buildDateFilter(
  startDateStr: string,
  endDateStr: string
): Record<string, any> {
  const startDate: Date = startDateStr ? toUtcDate(startDateStr) : null;
  const endDate: Date = endDateStr ? toUtcDate(endDateStr) : null;
  if (startDate && endDate && !IsEarlierEndDate(startDate, endDate)) {
    ErrorHelper.BadRequestException(VALIDATE_DATE_MESSAGE);
  }

  return startDate || endDate
    ? {
        startDate: {
          ...(startDate && { [Op.gte]: startDate }),
          ...(endDate && { [Op.lte]: endDate }),
        },
      }
    : {};
}
export function IsEarlierEndDate(startDate: Date, endDate: Date): Boolean {
  return startDate <= endDate;
}

export function toUtcDate(date: Date | string) {
  const localTime = moment.tz(date, "Asia/Bangkok");
  const utcTime = moment.utc(localTime.format("YYYY-MM-DD HH:mm:ss"));
  return utcTime.toDate();
}
