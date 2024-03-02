/**
 * Common class for all types of objects with similar behaviour
 */
export class Entity
{
    public uid: string = "";
    public name: string = "";
}

export class FileObj
{
    public id: string = "";
    public name: string = "";
    public type: string = "";
    public status: number = -1;
}

export class MemberObj
{
    public id: string = "";
    public name: string = "";
    public role: string = "";
    public serial: number = -1;
    public pubkey: string = "";
    public joined: Date = new Date();
}

export class AddableMemberObj
{
    public id: string = "";
    public name: string = "";
    public checked: boolean = false;
}

export class Tab
{
    public name: string = "";
    public active: boolean = false;
}

export class ForumMessage
{
    public id: string = "";
    public sender: string = "";
    public content: string = "";
    public created_at: Date = new Date();
}

export class ForumThread
{
    public id: string = "";
    public name: string = "";
}