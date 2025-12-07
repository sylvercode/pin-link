import * as PinLinkApp from "./apps/pin-link";
import type { LibWrapperWrapperDefinitions } from "fvtt-lib-wrapper-types";
import { HookDefinitions } from "fvtt-hook-attacher";

/**
 * Interface for the Sylvercode Pin Link module, extending Foundry's Module interface.
 */
export interface PinLink

  extends foundry.packages.Module {

}

/**
 * Callback type for module initialization.
 */
export type OnInitModuleFunc = (module: PinLink) => void;

/**
 * Contains static properties for module hooks, libWrapper patches, and hook definitions.
 */
export class PinLinkHooks {
  /**
   * Iterable of callbacks to be called on module initialization.
   */
  static ON_INIT_MODULE_CALLBACKS: Iterable<OnInitModuleFunc> = [
  ];

  /**
   * Iterable of libWrapper patch definitions to be registered.
   */
  static LIBWRAPPER_PATCHS: Iterable<LibWrapperWrapperDefinitions> = [
    ...PinLinkApp.LIBWRAPPER_PATCHS,
  ];

  /**
   * Set of hook definitions to be attached.
   */
  static HOOKS_DEFINITIONS_SET: Iterable<HookDefinitions> = [
    ...PinLinkApp.HOOKS_DEFINITIONS,
  ]
}
