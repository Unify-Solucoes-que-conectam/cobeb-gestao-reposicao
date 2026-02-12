import vanillaDayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import calendar from 'dayjs/plugin/calendar'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isToday from 'dayjs/plugin/isToday'
import isTomorrow from 'dayjs/plugin/isTomorrow'
import isYesterday from 'dayjs/plugin/isYesterday'
import minMax from 'dayjs/plugin/minMax'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

vanillaDayjs.extend(advancedFormat)
vanillaDayjs.extend(calendar)
vanillaDayjs.extend(customParseFormat)
vanillaDayjs.extend(isBetween)
vanillaDayjs.extend(isSameOrAfter)
vanillaDayjs.extend(isSameOrBefore)
vanillaDayjs.extend(isToday)
vanillaDayjs.extend(isTomorrow)
vanillaDayjs.extend(isYesterday)
vanillaDayjs.extend(minMax)
vanillaDayjs.extend(relativeTime)
vanillaDayjs.extend(timezone)
vanillaDayjs.extend(utc)

vanillaDayjs.locale('pt-br')
vanillaDayjs.tz.setDefault('America/Sao_Paulo')

const dayjs = vanillaDayjs

export default dayjs
