#!/usr/bin/env node

import figlet from "figlet";
import { Command } from 'commander';
import { PuppetX, ERR_NOT_LOGGED_IN, URL_TWITTER_HOME } from "./puppetx";
import puppeteer, { PageEvent } from "puppeteer";

console.error(figlet.textSync(PuppetX.name));
const app = new Command(PuppetX.name);

function printOptions(
    user: string,
    userDataDir: string,
    headless: boolean
) {
    console.log('🩵  X username(handle):', user);
    console.log('🩵  User data directory:', userDataDir);
    console.log('🩵  Headless mode:', headless);
}

app.command('login')
    .description('perform login in headful mode')
    .requiredOption('-u, --user <username>', 'X username (example: elonmusk)')
    .action(async (opts) => {
        const user = opts['user'];
        const userDataDir = PuppetX.getUserDataDir(user);
        const headless = false; // enforce headful mode
        printOptions(user, userDataDir, headless);
        const launchOpts = {
            headless,
            userDataDir,
            defaultViewport: null
        };
        const browser = await puppeteer.launch(launchOpts);
        const page = await browser.newPage();
        let willClose = false;
        // checking if login is successful or not
        page.on(PageEvent.Response, async resp => {
            if(await PuppetX.checkLoggedIn(page) && !willClose) {
                console.log('👍 Login detected!!');
                willClose = true;
                await browser.close();
            }
        });
        await page.goto(URL_TWITTER_HOME);
    });

app.command('post')
    .description('post a tweet')
    .argument('<tweet>')
    .requiredOption('-u, --user <username>', 'X username (example: elonmusk)')
    .option('-H, --headless <headless>', 'use headless mode. use "false" for debugging. defaults to "true"')
    .action(async (tweet, opts) => {
        const user = opts.user;
        const userDataDir = PuppetX.getUserDataDir(user);
        // defaults to true
        const headless = 'false'!==opts.headless;

        printOptions(user, userDataDir, headless);

        console.log(`🤞 Posting... "${tweet}"`);

        const bot = new PuppetX(user, headless);
        try {
            await bot.postTweet(tweet);
            await bot.close();
            console.log('🎉 Done.');
        } catch (e) {
            if(e instanceof Error) {
                if(ERR_NOT_LOGGED_IN===e.message) {
                    console.log(`Not logged in as "${user}"`);
                    console.log(`perform 'login' first`);
                    process.exitCode = 1;
                }
            }
        }
    });

app.parse();
