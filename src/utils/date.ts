import { Op } from 'sequelize';
import { ErrorHelper } from 'src/helpers/error.utils';
import { VALIDATE_DATE_MESSAGE } from 'src/common/messages/common.message';
export function buildDateFilter(startDateStr: Date, endDateStr: Date): Record<string, any> {
  const startDate: Date = startDateStr ? new Date(startDateStr) : null;
  const endDate: Date = endDateStr ? new Date(endDateStr) : null;
  if (startDate && endDate && !IsEarlierEndDate(startDate, endDate)) {
    ErrorHelper.BadRequestException(VALIDATE_DATE_MESSAGE);
  }

  return startDate || endDate
    ? {
        createdAt: {
          ...(startDate && { [Op.gte]: startDate }),
          ...(endDate && { [Op.lte]: endDate }),
        },
      }
    : {};
}
export function IsEarlierEndDate(startDate: Date, endDate: Date): Boolean {
  return startDate <= endDate;
}
