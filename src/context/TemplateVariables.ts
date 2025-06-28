export class TemplateVariables {
    private readonly variables = new Map<string, any>();

    public setVariable(key: string, variable: any): void {
        this.variables.set(key, variable);
    }

    public getVariables(): { [key: string]: any } {
        return Object.fromEntries(this.variables);
    }
}