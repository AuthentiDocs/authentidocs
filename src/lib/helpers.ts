const all_colors: string[] = ["red", "green", "blue", "purple"];
const months: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function gen_random_color(): string
{
    return all_colors[Math.round(Math.random() * (all_colors.length - 1))];
}

export function make_date(date: Date): string
{
    if(date === null || date === undefined)
    {
        return "";
    }

    return months[date.getMonth()] + " " + date.getDate().toString().padStart(2, "0") + ", " + date.getFullYear();
}

export function make_time(date: Date): string
{
    if(date === null || date === undefined)
    {
        return "";
    }

    let hours: number = date.getHours();
    let ampm: string = (hours >= 12) ? " PM" : " AM";
    hours %= 12;

    return hours.toString().padStart(2, "0") + ":" + date.getMinutes().toString().padStart(2, "0") + ampm;
}
