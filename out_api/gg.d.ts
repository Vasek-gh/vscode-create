declare module "Protocol" {
    export interface ActionDisplayDescriptor {
        readonly caption: string;
        readonly description?: string;
        readonly detail?: string;
    }
    export interface SuggestionActionDescriptor {
        readonly uuid: string;
        readonly extension: string;
        readonly getDisplayInfoCommandId: string;
    }
}
declare module "Client" {
    export { ActionDisplayDescriptor } from "Protocol";
}
