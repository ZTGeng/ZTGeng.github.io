window.sharedBlogMethods = {
    mdToHtml(md) {
        const paragraphs = md
            // Remove carriage returns
            .replace(/\r\n/g, '\n')
            // Split paragraphs to isolate code blocks
            .split(/\n```\n|\n```$/)
            .flatMap((textOrCode, index) => {
                if (index % 2 === 0) {
                    return this.textBlockToHtml(textOrCode);
                } else {
                    // Convert code blocks
                    return [this.codeBlockToHtml(textOrCode)];
                }
            });

        // console.log(paragraphs)
        return paragraphs.join('');
    },
    textBlockToHtml(text) {
        text = this.escapeText(text);
        // Wrap heading lines with line breaks to prevent them from being merged into paragraphs
        text = text.replace(/^(#{1,6} .*)$/gm, '\n$1\n');
        // Convert horizontal rules
        text = text.replace(/^\-\-\-$|!\_\_\_$/gm, '<hr>');
        // Convert text to paragraphs
        text = text
            .split(/\n{2,}/)
            .map(paragraph => {
                paragraph = paragraph.trim();
                // Wrap paragraphs in tags
                if (/^#{1,6} /.test(paragraph)) {
                    paragraph = this.headingToHtml(paragraph);
                } else if (/^\>/.test(paragraph)) {
                    paragraph = this.blockquoteToHtml(paragraph);
                } else if (/^\d+\.\s+/.test(paragraph)) {
                    paragraph = this.orderedListToHtml(paragraph);
                } else if (/^[\*\-\+]\s+/.test(paragraph)) {
                    paragraph = this.unorderedListToHtml(paragraph);
                } else {
                    paragraph = this.textToHtml(paragraph);
                }
                return paragraph;
            });
        // Find consecutive ordered/unordered lists
        // remove </ol> or </ul> from the first one end and <ol> or <ul> from the second one head
        for (let i = 0; i < text.length - 1; i++) {
            if (text[i].endsWith('</ol>') && /^\<ol\>|^\<ol start\=\"\d+\"\>/.test(text[i + 1])) {
                text[i] = text[i].slice(0, -5);
                text[i + 1] = text[i + 1].replace(/^\<ol\>|^\<ol start\=\"\d+\"\>/, '');
            } else if (text[i].endsWith('</ul>') && text[i + 1].startsWith('<ul>')) {
                text[i] = text[i].slice(0, -5);
                text[i + 1] = text[i + 1].slice(4);
            }
        }
        // Split paragraphs to isolate inline code
        return text
            .flatMap(paragraph => {
                return paragraph.split(/`(.+?)`/g).map((textOrCode, index) => {
                    if (index % 2 === 0) {
                        return textOrCode
                            // Convert images
                            .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="img-fluid mb-3" style="max-width: 100%;">')
                            // Convert links
                            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
                            // Convert emphasis
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            // Convert strikethrough
                            .replace(/~~(.*?)~~/g, '<del>$1</del>');
                    } else {
                        // Convert inline code
                        return this.codeToHtml(textOrCode);
                    }
                });
            });
    },
    codeBlockToHtml(code) {
        code = this.escapeCode(code);
        return '<pre class="bg-light p-2" style="white-space: pre-wrap"><code>' + code + '</code></pre>';
    },
    codeToHtml(code) {
        code = this.escapeCode(code);
        return '<code>' + code + '</code>';
    },
    headingToHtml(heading) {
        // Assume: single line, starts with 1-6 #s followed by a space
        // When assume failed, should treat as text

        // Get the text
        const text = heading.replace(/^#{1,6} /, '');
        // Get the level
        const level = heading.length - text.length - 1;
        if (level < 1 || level > 6) {
            // Treat as text
            return this.textToHtml(heading);
        }
        return '<h' + level + '>' + text.trim() + '</h' + level + '>';
    },
    blockquoteToHtml(blockquote) {
        // Assume: single or multiple lines, first line or each line starts with >
        // When assume failed, should throw error
        if (!blockquote.startsWith('>')) {
            throw new Error('Blockquote should start with >. Got: ' + blockquote);
        }

        return '<blockquote class="blockquote">' + blockquote.replace(/^\>\s*(.*)$/gm, '$1') + '</blockquote>';
    },
    orderedListToHtml(list) {
        // Assume: single or multiple lines
        // first and maybe more lines start with number followed by a dot and one or more spaces
        // When assume failed, should throw error
        if (!list.match(/^\d+\.\s+/)) {
            throw new Error('Ordered list should start with a number. Got: ' + list);
        }

        // Get the number in the first line.
        const number = list.match(/^\d+/)[0];
        // Replace all the leading numbers with </li><li>
        list = list.replace(/^\d+\.\s+/gm, '</li><li>');
        // Remove the first </li>
        list = list.replace(/^<\/li>/, '');
        // add the <ol> tags and set the start number
        return '<ol start="' + number + '">' + list + '</li></ol>';
    },
    unorderedListToHtml(list) {
        // Assume: single or multiple lines
        // first and maybe more lines start with *, - or + followed by one or more spaces
        // When assume failed, should throw error
        if (!list.match(/^[\*\-\+]\s+/)) {
            throw new Error('Unordered list should start with *, - or +. Got: ' + list);
        }

        // Replace all the leading *, - or + with </li><li>
        list = list.replace(/^[\*\-\+]\s+/gm, '</li><li>');
        // Remove the first </li>
        list = list.replace(/^<\/li>/, '');
        // add the <ul> tags
        return '<ul>' + list + '</li></ul>';
    },
    textToHtml(text) {
        return '<p>' + text + '</p>';
    },
    escapeCode(code) {
        return code.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },
    escapeText(text) {
        return text.replace(/\\(.)/g, match => {
            switch (match[1]) {
                case '~':
                    return '&#126;';
                case '`':
                    return '&#96;';
                case '!':
                    return '&#33;';
                case '@':
                    return '&#64;';
                case '#':
                    return '&#35;';
                case '$':
                    return '&#36;';
                case '%':
                    return '&#37;';
                case '^':
                    return '&#94;';
                case '&':
                    return '&amp;';
                case '*':
                    return '&#42;';
                case '_':
                    return '&#95;';
                case '-':
                    return '&#45;';
                case '+':
                    return '&#43;';
                case '=':
                    return '&#61;';
                case '{':
                    return '&#123;';
                case '}':
                    return '&#125;';
                case '[':
                    return '&#91;';
                case ']':
                    return '&#93;';
                case '(':
                    return '&#40;';
                case ')':
                    return '&#41;';
                case '|':
                    return '&#124;';
                case '\\':
                    return '&#92;';
                case ':':
                    return '&#58;';
                case ';':
                    return '&#59;';
                case '"':
                    return '&quot;';
                case '\'':
                    return '&#39;';
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '.':
                    return '&#46;';
                case '?':
                    return '&#63;';
                case ',':
                    return '&#44;';
                case '/':
                    return '&#47;';
                default:
                    return match;
            }
        });
    }
}