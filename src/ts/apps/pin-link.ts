
import { HookDefinitions } from 'fvtt-hook-attacher';
import { LibWrapperBaseCallback, LibWrapperBaseCallbackArgs, LibWrapperWrapperDefinitions } from 'fvtt-lib-wrapper-types';
import ApplicationV2 from 'node_modules/fvtt-types/src/foundry/client/applications/api/application.mjs';

interface NoteFlags {
  link?: string;
}

declare module "fvtt-types/configuration" {
  interface FlagConfig {
    Note: {
      ['pin-link']?: NoteFlags;
    };
  }
}

async function renderNoteConfig(
  _application: NoteConfig,
  element: HTMLElement,
  context: ApplicationV2.RenderContextOf<NoteConfig>,
  _options: ApplicationV2.RenderOptionsOf<NoteConfig>
) {

  const journalSelect = element.querySelector('select[name="entryId"]');
  if (!journalSelect)
    throw new Error("Could not find journal select element");

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'pin-link-btn flex0';
  button.innerHTML = '<i class="fa-solid fa-link"></i>';
  journalSelect.after(button);

  const submitButton = element.querySelector('button[type="submit"]');
  if (!submitButton)
    throw new Error("Could not find submit button element");

  const hiddenDiv = document.createElement('div');
  hiddenDiv.className = 'form-group';
  hiddenDiv.style.display = 'none';
  hiddenDiv.innerHTML = `<label>Link</label>
                            <div class="form-fields">
                                <input type="hidden" name="flags.pin-link.link" />
                            </div>`;
  submitButton.before(hiddenDiv);

  updateUI(getFlags(context.document), element);

  element.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.pin-link-btn')) return;

    const oldValue = hiddenDiv.querySelector('input')?.value ?? "";
    const newValue = await foundry.appv1.api.Dialog.prompt({
      content: `<input type="text" value="${oldValue}">`,
      callback: (html) => {
        return html.find('input')?.val() as string;
      }
    });

    const LinkJournalId =
      game.collections?.get("JournalEntry")
        ?.search({ "query": "Link" })[0]?.id;
    if (LinkJournalId) {
      (journalSelect as HTMLSelectElement).value = LinkJournalId;
    }

    updateUI({ link: newValue }, element);
  });
}

function getFlags(note: NoteDocument) {
  return note?.flags['pin-link'] ?? {};
}

function updateUI(flags: NoteFlags, html: HTMLElement) {
  const linkstate = flags?.link ? 'set' : 'unset';
  html.querySelector('.pin-link-btn')?.setAttribute('linkstate', linkstate);
  (html.querySelector('[name^="flags.pin-link.link"') as HTMLInputElement).value = flags?.link ?? "";
}

async function _onUnclickLeft(this: Note, wrapped: LibWrapperBaseCallback, ...args: LibWrapperBaseCallbackArgs) {
  const flags = getFlags(this.document);
  if (flags?.link) {
    window.open(flags.link, '_blank', 'noopener,noreferrer');
    return true;
  }
  return wrapped(...args);
}

async function _onNoteCan(this: MouseInteractionManager, wrapped: LibWrapperBaseCallback, ...args: LibWrapperBaseCallbackArgs) {
  if (this.layer.name !== "Notes")
    return wrapped(...args);

  const note = this.object as Note;
  if (note) {
    const noteDoc = note.document
    const flags = getFlags(noteDoc);
    if (flags?.link)
      return true;
  }
  return wrapped(...args);
}

export const HOOKS_DEFINITIONS: Iterable<HookDefinitions> = [{
  on: [
    {
      name: "renderNoteConfig",
      callback: renderNoteConfig
    }
  ]
}];

export const LIBWRAPPER_PATCHS: Iterable<LibWrapperWrapperDefinitions> = [
  {
    target: "foundry.canvas.interaction.MouseInteractionManager.prototype.can",
    fn: _onNoteCan,
    type: "MIXED"
  },
  {
    target: "foundry.canvas.placeables.Note.prototype._onUnclickLeft",
    fn: _onUnclickLeft,
    type: "MIXED"
  }
];
