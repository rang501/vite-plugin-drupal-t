declare namespace Drupal {
  /**
   * Translates a string to the current language.
   *
   * @param str
   *   A string containing the English text to translate.
   * @param args
   *   An object of replacements pairs to make after translation. Incidences
   *   of any key in this array are replaced with the corresponding value.
   * @param options
   *   Additional options for translation.
   * @returns
   *   The translated string.
   */
  function t(str: string, args?: Record<string, string>, options?: { context?: string }): string;

  /**
   * Translates a string to the current language and formats it as a plural.
   *
   * @param count
   *   The number to determine the plural form.
   * @param singular
   *   The singular form of the string.
   * @param plural
   *   The plural form of the string.
   * @param args
   *   An object of replacements pairs to make after translation. Incidences
   *   of any key in this array are replaced with the corresponding value.
   * @param options
   *   Additional options for translation.
   * @returns
   *   The translated string in the correct plural form.
   */
  function formatPlural(
    count: number,
    singular: string,
    plural: string,
    args?: Record<string, string>,
    options?: { context?: string }
  ): string;
}