import os from 'os';
import path from 'path';
import puppeteer, { Browser, Page } from 'puppeteer';
import sleep from 'sleep-promise';

const NAME_LIB = 'PuppetX';
const DIRNAME_PROFILES_BASE = `${NAME_LIB.toLowerCase()}_data`;
const DELAY_MS_PREVIEW_GEN = 1000;  // delay for preview generation
export const URL_TWITTER_HOME = 'https://twitter.com';
export const ERR_NOT_LOGGED_IN = 'Not logged in';

export interface UserProfile {
    /**
     * "@elonmusk" for example
     */
    handle: string,
    /**
     * "Elon Musk" for example
     */
    dispName: string
}

export class PuppetX {
    readonly username: string;
    readonly headless: boolean;
    loggedIn = false;
    browser: Browser;
    page: Page;
    constructor(username: string, headless: boolean) {
        this.username = username;
        this.headless = headless;
    }

    /**
     * @throws {Error} the cookie for session is not available.
     * @returns {Promise<void>}
     */
    async ensureLoggedIn() {
        if(this.loggedIn) return;
        const launchOpts = {
            headless: this.headless,
            userDataDir: this.getProfileDir(),
        };
        this.browser = await puppeteer.launch(launchOpts);
        this.page = await this.browser.newPage();
        await this.page.goto(URL_TWITTER_HOME);

        if(this.headless) {
            // act more headful
            // https://medium.com/@addnab/puppeteer-quick-fix-for-differences-between-headless-and-headful-versions-of-a-webpage-5b168bd5fe4a
            const headlessUserAgent = await this.page.evaluate(() => navigator.userAgent);
            const chromeUserAgent = headlessUserAgent.replace('HeadlessChrome', 'Chrome');
            await this.page.setUserAgent(chromeUserAgent);
        }

        this.loggedIn = await PuppetX.checkLoggedIn(this.page);
        if(!this.loggedIn) throw new Error(ERR_NOT_LOGGED_IN);
    }

    static async checkLoggedIn(page: Page) {
        try {
            return (await page.cookies()).filter(c => c.name==='twid').length>0;
        } catch (e) {
            // ignore with intention
            return false;
        }
    }

    async fetchProfile() {
        await this.ensureLoggedIn();
        const profileUrl = `${URL_TWITTER_HOME}/${this.username}`;
        await this.page.goto(profileUrl);
        await this.page.waitForSelector('div[data-testid="UserName"]');
        const profile: UserProfile = await this.page.evaluate(() => {
            const labels = document.querySelectorAll('div[data-testid="UserName"] div[dir]');
            const dispName = labels[0].textContent;
            const handle = labels[1].textContent;
            return { dispName, handle };
        });
        return profile;
    }

    async postTweet(text: string) {
        try {
            await this.ensureLoggedIn();
        } catch (ex) {
            console.log('exception!!! stack ',ex.stack);
        }
        await this.page.goto('https://twitter.com/compose/post');
        // find the text field
        await this.page.type('div[contenteditable="true"]', text);
        // wait for generating a preview if any
        await sleep(DELAY_MS_PREVIEW_GEN);
        await this.page.click('div[data-testid="tweetButton"]');
    }

    public static getUserDataDir(username: string) {
        return path.join(os.homedir(), DIRNAME_PROFILES_BASE, username);
    }

    public getProfileDir() {
        return PuppetX.getUserDataDir(this.username)
    }

    async close() {
        if(this.page) {
            await this.page.close();
        }
        if(this.browser) {
            await this.browser.close();
        }
    }
}
