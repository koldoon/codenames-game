type SwitchHandlerFunction = (val?: any) => any;
type ValueOption = 'true' | 'false' | 'else' | 'null' | 'undefiled' | 'NaN' | string;
type SwitchHandlerOptions = { [option in ValueOption]: SwitchHandlerFunction };

export function switchHandler(value: string | number | boolean, options: SwitchHandlerOptions) {
    const opt = String(value);

    if (options.hasOwnProperty(opt))
        return options[opt](value);

    if (options.hasOwnProperty('else'))
        return options.else(value);
}
