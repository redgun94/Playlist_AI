import {Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'duration',
    standalone : true
})
export class DurationPipe implements PipeTransform {
    transform(value: number): string{
        if(!value && value != 0) return '';
        const totalSeconds = Math.floor(value / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formatedSecond = seconds < 10 ? "0"+ `${seconds}` : seconds;
        return `${minutes}:${formatedSecond}`; 
    }
}