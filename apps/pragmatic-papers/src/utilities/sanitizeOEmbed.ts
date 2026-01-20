function stripScripts(html: string): string {
    // remove any <script ...>...</script> blocks
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

function stripEventHandlers(html: string): string {
    // remove inline on* handlers like onclick="..."
    return html.replace(/\son\w+="[^"]*"/gi, '').replace(/\son\w+='[^']*'/gi, '')
}

export function sanitizeOEmbed(html: string): string {
    return stripEventHandlers(stripScripts(html))
}