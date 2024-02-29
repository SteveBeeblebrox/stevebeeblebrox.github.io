declare function nameof(prop: any): string;
const __nameof__ = (prop: string): string => prop.match(/[^.!]+(?=!?$)/)![0];
///#define nameof(prop) __nameof__(#prop)