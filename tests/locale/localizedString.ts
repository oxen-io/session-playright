import {
  getLocale,
  getStringForCardinalRule,
  getFallbackDictionary,
  getTranslationDictionary,
} from './shared';

import { LOCALE_DEFAULTS } from '../localization/constants';
import { en } from '../localization/locales';
import { LocalizerDictionary } from './localizerType';
import { deSanitizeHtmlTags, sanitizeArgs } from './argsSanitizer';

type PluralKey = 'count';

type ArgString = `${string}{${string}}${string}`;
type RawString = ArgString | string;

type PluralString =
  `{${PluralKey}, plural, one [${RawString}] other [${RawString}]}`;

type GenericLocalizedDictionary = Record<string, RawString | PluralString>;

export type TokenString<Dict extends GenericLocalizedDictionary> =
  keyof Dict extends string ? keyof Dict : never;

/** The dynamic arguments in a localized string */
type StringArgs<T extends string> =
  /** If a string follows the plural format use its plural variable name and recursively check for
   *  dynamic args inside all plural forms */
  T extends `{${infer PluralVar}, plural, one [${infer PluralOne}] other [${infer PluralOther}]}`
    ? PluralVar | StringArgs<PluralOne> | StringArgs<PluralOther>
    : /** If a string segment follows the variable form parse its variable name and recursively
     * check for more dynamic args */
    T extends `${string}{${infer Var}}${infer Rest}`
    ? Var | StringArgs<Rest>
    : never;

export type StringArgsRecord<T extends string> = Record<
  StringArgs<T>,
  string | number
>;

function getPluralKey<R extends PluralKey>(string: PluralString): R {
  const match = /{(\w+), plural, one \[.+\] other \[.+\]}/g.exec(string);
  return match?.[1] as R;
}

// TODO This regex is only going to work for the one/other case what about other langs where we can have one/two/other for example
const isPluralForm = (
  localizedString: string,
): localizedString is PluralString =>
  /{\w+, plural, one \[.+\] other \[.+\]}/g.test(localizedString);

/**
 * Checks if a string contains a dynamic variable.
 * @param localizedString - The string to check.
 * @returns `true` if the string contains a dynamic variable, otherwise `false`.
 */
const isStringWithArgs = (
  localizedString: string,
): localizedString is ArgString => localizedString.includes('{');

const isReplaceLocalizedStringsWithKeysEnabled = () => false;

class LocalizedStringBuilder<
  Dict extends GenericLocalizedDictionary,
  T extends TokenString<Dict>,
> {
  private readonly token: T;
  private args?: StringArgsRecord<Dict[T]>;
  private isStripped = false;
  private isEnglishForced = false;

  private readonly renderStringAsToken =
    isReplaceLocalizedStringsWithKeysEnabled();

  constructor(token: T) {
    this.token = token;
  }

  public toString(): string {
    try {
      if (this.renderStringAsToken) {
        return this.token;
      }

      const rawString = this.getRawString();
      const str = isStringWithArgs(rawString)
        ? this.formatStringWithArgs(rawString)
        : rawString;

      if (this.isStripped) {
        return this.postProcessStrippedString(str);
      }

      return str;
    } catch (error) {
      console.log(error);
      return this.token;
    }
  }

  withArgs(args: StringArgsRecord<Dict[T]>): Omit<this, 'withArgs'> {
    this.args = args;
    return this;
  }

  forceEnglish(): Omit<this, 'forceEnglish'> {
    this.isEnglishForced = true;
    return this;
  }

  strip(): Omit<this, 'strip'> {
    const sanitizedArgs = this.args
      ? sanitizeArgs(this.args, '\u200B')
      : undefined;
    if (sanitizedArgs) {
      this.args = sanitizedArgs as StringArgsRecord<Dict[T]>;
    }
    this.isStripped = true;

    return this;
  }

  private postProcessStrippedString(str: string): string {
    const strippedString = str.replaceAll(/<[^>]*>/g, '');
    return deSanitizeHtmlTags(strippedString, '\u200B');
  }

  private getRawString(): RawString | TokenString<Dict> {
    try {
      if (this.renderStringAsToken) {
        return this.token;
      }

      const dict: GenericLocalizedDictionary = this.isEnglishForced
        ? en
        : getTranslationDictionary();

      let localizedString = dict[this.token];

      if (!localizedString) {
        console.log(
          `Attempted to get translation for nonexistent key: '${this.token}'`,
        );

        localizedString = (
          getFallbackDictionary() as GenericLocalizedDictionary
        )[this.token];

        if (!localizedString) {
          console.log(
            `Attempted to get translation for nonexistent key: '${this.token}' in fallback dictionary`,
          );
          return this.token;
        }
      }

      return isPluralForm(localizedString)
        ? this.resolvePluralString(localizedString)
        : localizedString;
    } catch (error) {
      console.log(error.message);
      return this.token;
    }
  }

  private resolvePluralString(str: PluralString): string {
    const pluralKey = getPluralKey(str);

    // This should not be possible, but we need to handle it in case it does happen
    if (!pluralKey) {
      console.log(
        `Attempted to get nonexistent pluralKey for plural form string '${str}' for token '${this.token}'`,
      );
      return this.token;
    }

    let num = this.args?.[pluralKey as keyof StringArgsRecord<Dict[T]>];

    if (num === undefined) {
      console.log(
        `Attempted to get plural count for missing argument '${pluralKey} for token '${this.token}'`,
      );
      num = 0;
    }

    if (typeof num !== 'number') {
      console.log(
        `Attempted to get plural count for argument '${pluralKey}' which is not a number for token '${this.token}'`,
      );
      num = parseInt(num, 10);
      if (Number.isNaN(num)) {
        console.log(
          `Attempted to get parsed plural count for argument '${pluralKey}' which is not a number for token '${this.token}'`,
        );
        num = 0;
      }
    }

    const currentLocale = this.forceEnglish() ? 'en' : getLocale();
    const cardinalRule = new Intl.PluralRules(currentLocale).select(num);

    const pluralString = getStringForCardinalRule(str, cardinalRule);
    if (!pluralString) {
      console.log(
        `Plural string not found for cardinal '${cardinalRule}': '${str}'`,
      );
      return this.token;
    }

    return pluralString.replaceAll('#', `${num}`);
  }

  private formatStringWithArgs(str: ArgString): string {
    /** Find and replace the dynamic variables in a localized string and substitute the variables with the provided values */
    return str.replace(/\{(\w+)\}/g, (match, arg: string) => {
      const matchedArg = this.args
        ? this.args[arg as keyof StringArgsRecord<Dict[T]>]?.toString()
        : undefined;

      return (
        matchedArg ??
        LOCALE_DEFAULTS[arg as keyof typeof LOCALE_DEFAULTS] ??
        match
      );
    });
  }
}

function localize<T extends TokenString<LocalizerDictionary>>(token: T) {
  return new LocalizedStringBuilder<LocalizerDictionary, T>(token);
}

export function englishStrippedStr<T extends TokenString<LocalizerDictionary>>(
  token: T,
) {
  return localize(token).forceEnglish().strip();
}
