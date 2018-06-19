import { TokenType, IToken, IParserErrorMessageProvider } from "chevrotain";
export declare class ArgdownErrorMessageProvider implements IParserErrorMessageProvider {
    buildMismatchTokenMessage(options: {
        expected: TokenType;
        actual: IToken;
        previous: IToken;
        ruleName: string;
    }): string;
    buildNotAllInputParsedMessage(options: {
        firstRedundant: IToken;
        ruleName: string;
    }): string;
    buildNoViableAltMessage(options: {
        expectedPathsPerAlt: TokenType[][][];
        actual: IToken[];
        previous: IToken;
        customUserDescription: string;
        ruleName: string;
    }): string;
    buildEarlyExitMessage(options: {
        expectedIterationPaths: TokenType[][];
        actual: IToken[];
        previous: IToken;
        customUserDescription: string;
        ruleName: string;
    }): string;
}
