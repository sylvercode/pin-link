
import { libWrapper } from './lib-wrapper/shim.js';

async function renderNoteConfig(app, html, data, label) {

    let journalSelect = html.find('div.form-group:has(label:contains("Journal")) select')
    journalSelect.after(
        `<button type='button' class='pin-link-btn flex0'>
            <i class="fa-solid fa-link"></i>
         </button>`
    );

    html.find('button[type="submit"]')
        .before(`<div class="form-group" style="display: none;">
                 <label>Link</label>
                     <div class="form-fields">
                         <input type="hidden" name="flags.pin-link.link" />
                     </div>
                 </div>`);

    updateUI(data.data, html);

    html.on('click', '.pin-link-btn', async () => {
        let oldValue = getFlags(data.data)?.link ?? "";
        let newValue = await Dialog.prompt({
            content: `<input type="text" value="${oldValue}">`,
            callback: (html) => {
                html.find('input').val()
            }
        });

        let LinkJournalId =
            game.collections.get("JournalEntry")
            .search({ "query": "Link" })[0]?.id;
        if (LinkJournalId) {
            journalSelect.val(LinkJournalId);
        }

        setFlags(data.data, { link: newValue }, html);
        updateUI(data.data, html);
    });
}

function getFlags(note) {
    return note?.flags['pin-link'] ?? {};
}

function updateUI(note, html) {
    let flags = getFlags(note);
    let linkstate = flags?.link ? 'set' : 'unset';
    html.find('.pin-link-btn').attr('linkstate', linkstate);
    html.find('[name^="flags.pin-link.link"').val(flags?.link);
}

function setFlags(note, flags) {
    note.flags['pin-link'] = flags;
}


async function updateNote(note, data, options, userId) {
    let flags = getFlags(data);
    note.update({
        'flags.pin-link': flags
    })
}

async function _onUnclickLeft(wrapped, ...args) {
    let flags = getFlags(this.document);
    if (flags?.link) {
        window.open(flags.link, '_blank', 'noopener,noreferrer');
        return true;
    }
    return wrapped(...args);
}

async function _onNoteCan(wrapped, ...args) {
    let note = this.target?.parent?.document?.documentName;
    if (note) {
        let noteDoc = this.target.parent.document
        let flags = getFlags(noteDoc);
        if (flags?.link)
            return true;
    }
    return wrapped(...args);
}

Hooks.once("canvasInit", function () {
    if (game.user.isGM) {
        libWrapper.register(
            'sylvercode-pin-link',
            "Note.prototype._onUnclickLeft",
            _onUnclickLeft,
            "MIXED",
        );

        libWrapper.register(
            'sylvercode-pin-link',
            "MouseInteractionManager.prototype.can",
            _onNoteCan,
            "MIXED",
        );
    }
});

Hooks.once('ready', () => {
    if (game.permissions.NOTE_CREATE.includes(game.user.role)) {
        Hooks.on("renderNoteConfig", renderNoteConfig);
        Hooks.on("updateNote", updateNote)
        Hooks.on("createNote", updateNote)
    }
});
