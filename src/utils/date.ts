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

  console.log("ádfasdfasd: ", startDate, endDate);
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

export function getUtcRangeForLocalDay(date: Date) {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

export function getUtcForLocalDayV2(date: Date) {
  const start = new Date(date);
  start.setUTCHours(
    start.getHours() + 1,
    start.getMinutes(),
    start.getSeconds(),
    0
  );

  return start;
}
