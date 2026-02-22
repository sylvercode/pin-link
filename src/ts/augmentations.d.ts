/**
 * Type augmentations for outdated Foundry VTT type definitions
 * These declarations extend existing types without modifying external packages
 */

declare module "fvtt-types/src/foundry/client/canvas/layers/notes-layer" {
    interface NotesLayer {
        clipboard: {
            cut: boolean;
            objects: PlaceableObject[];
        };
    }
}
