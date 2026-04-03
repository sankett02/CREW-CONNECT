import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, ChevronDown } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import type { DropdownProps } from 'react-day-picker';
import * as Popover from '@radix-ui/react-popover';
import * as Select from '@radix-ui/react-select';

interface DatePickerProps {
    date?: Date;
    onChange: (date?: Date) => void;
    placeholder?: string;
}

const CustomDropdown = (props: DropdownProps) => {
    const { value, onChange, children, name } = props;

    // Safely extract options from selected children (which are <option> elements)
    const options = React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
            const c = child as React.ReactElement<{ value: any; children: React.ReactNode }>;
            return {
                value: c.props.value?.toString() || "",
                label: typeof c.props.children === 'string' ? c.props.children : c.props.children?.toString() || "",
            };
        }
        return null;
    })?.filter(Boolean) as { value: string; label: string }[];

    const handleValueChange = (newValue: string) => {
        if (onChange) {
            const event = {
                target: { value: newValue, name },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange(event);
        }
    };

    const currentValue = value?.toString();
    const currentOption = options?.find(o => o.value === currentValue);
    const currentLabel = currentOption?.label || "Select";

    return (
        <Select.Root value={currentValue} onValueChange={handleValueChange}>
            <Select.Trigger className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[12px] font-bold text-white hover:bg-white/10 hover:border-indigo-500/50 transition-all outline-none min-w-[105px] justify-between group shadow-xl">
                <Select.Value aria-label={currentValue}>{currentLabel}</Select.Value>
                <Select.Icon>
                    <ChevronDown size={14} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content 
                    position="popper"
                    sideOffset={5}
                    className="z-[120] bg-[#0a0f1d] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden glass min-w-[155px] animate-in fade-in zoom-in duration-200"
                >
                    <Select.Viewport className="p-1.5 max-h-[300px] overflow-y-auto scrollbar-hide">
                        {options?.map((option) => (
                            <Select.Item
                                key={option.value}
                                value={option.value}
                                className="relative flex items-center px-9 py-2.5 text-[12px] font-bold text-slate-400 rounded-xl cursor-pointer outline-none transition-all data-[highlighted]:bg-indigo-600 data-[highlighted]:text-white data-[highlighted]:pl-10 data-[state=checked]:text-indigo-400 data-[state=checked]:bg-indigo-400/5 group"
                            >
                                <Select.ItemText>{option.label}</Select.ItemText>
                                <Select.ItemIndicator className="absolute left-3 flex items-center justify-center">
                                    <Check size={14} className="text-indigo-400 group-data-[highlighted]:text-white" />
                                </Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    );
};

const DatePicker: React.FC<DatePickerProps> = ({ date, onChange, placeholder = "Pick a date" }) => {
    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <div
                    className={`input flex items-center gap-2 text-left font-medium cursor-pointer transition-all hover:bg-white/5 ${!date ? "text-[#4a5578]" : "text-[#f0f4ff]"}`}
                >
                    <CalendarIcon size={14} className="text-indigo-400" />
                    {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
                </div>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className="glass z-[100] border border-white/10 animate-in fade-in zoom-in duration-300 shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-[24px] overflow-hidden"
                    align="start"
                    sideOffset={10}
                >
                    <DayPicker
                        mode="single"
                        selected={date}
                        onSelect={onChange}
                        showOutsideDays
                        captionLayout="dropdown"
                        fromYear={new Date().getFullYear()}
                        toYear={new Date().getFullYear() + 25}
                        className="p-5"
                        components={{
                            Dropdown: CustomDropdown,
                            IconLeft: () => <ChevronLeft size={16} />,
                            IconRight: () => <ChevronRight size={16} />,
                        }}
                        classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-6",
                            caption: "flex justify-between items-center relative gap-4 mb-4",
                            caption_label: "hidden", 
                            caption_dropdowns: "flex items-center gap-2 flex-1",
                            nav: "flex items-center gap-2",
                            nav_button: "h-9 w-9 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all opacity-100 text-indigo-400 hover:text-indigo-300 shadow-sm",
                            table: "w-full border-collapse pt-4 border-t border-white/5",
                            head_row: "flex mb-3",
                            head_cell: "text-[#4a5578] rounded-md w-10 font-black text-[0.65rem] uppercase tracking-[0.2em] opacity-80",
                            row: "flex w-full mt-2",
                            cell: "h-10 w-10 text-center text-sm p-0 relative focus-within:z-20",
                            day: "h-10 w-10 p-0 font-bold aria-selected:opacity-100 hover:bg-indigo-500/10 hover:text-indigo-300 rounded-2xl transition-all text-slate-300 flex items-center justify-center text-[0.8rem]",
                            day_selected: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_0_25px_rgba(99,102,241,0.5)] border-none scale-110 z-30 ring-2 ring-white/20",
                            day_today: "text-indigo-400 font-black ring-2 ring-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10",
                            day_outside: "text-[#4a5578] opacity-10",
                            day_disabled: "text-[#4a5578] opacity-10",
                            day_hidden: "invisible",
                        }}
                    />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};

export default DatePicker;
