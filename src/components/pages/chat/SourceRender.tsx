import { TChatExecutionHistory } from '@/types/chat'
import { NextPage } from 'next'
import {
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  Search,
  User,
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface Props {
  executionHistories: TChatExecutionHistory
}

const SourceRender: NextPage<Props> = ({ executionHistories }) => {
  const residents = executionHistories.chatExecutionHistoryItems
    .map((item) => item.resident || item.announcement || item.cashTransaction || item.duesBill || item.duesPeriod || item.duesType || item.familyCard || item.payment)
    .filter(Boolean)
  const columns = (residents.length
    ? Object.keys(residents[0]!)
    : []).filter(k => !['createdAt', 'updatedAt', 'id'].includes(k) && !k.endsWith('Id'))

  const formatColumnName = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (char) => char.toUpperCase())
  }

  const formatValue = (key: string, value: unknown) => {
    if (value === null || value === undefined || value === '') {
      return '-'
    }

    if (key.toLowerCase().includes('tanggal') || key.toLowerCase().includes('date')) {
      return new Date(String(value)).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    }

    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    return String(value)
  }

  return (
    <Collapsible className="w-full max-w-md">
      <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md py-1 text-left text-[10px] text-gray-500 hover:text-foreground ">
        <ChevronRight className="size-3 transition-transform group-data-[state=open]:rotate-90" />

        <Search className="size-3 flex-none" />

        <span className="font-medium text-foreground">
          {executionHistories.method}
        </span>

        <span className="ml-auto shrink-0">
          {residents.length} result{residents.length !== 1 ? 's' : ''}
        </span>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-1 pl-5">
        <div className="max-w-full max-h-60 overflow-auto">
          <table className="w-max min-w-full text-[10px]">
            <thead>
              <tr className="border-b border-gray-300 text-left text-muted-foreground">
                {columns.map((column) => (
                  <th
                    key={column}
                    className="whitespace-nowrap py-1.5 pr-4 font-medium"
                  >
                    {formatColumnName(column)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {residents.map((resident, index) => (
                <tr
                  key={resident!.id ?? index}
                  className="border-b border-gray-300 last:border-0"
                >
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="max-w-[180px] truncate whitespace-nowrap py-1.5 pr-4 text-muted-foreground"
                    >
                      {formatValue(
                        column,
                        (resident as Record<string, unknown>)[column]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export default SourceRender
