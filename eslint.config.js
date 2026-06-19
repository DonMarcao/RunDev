module.exports = [
    {
        files: ["static/assets/game.js"],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "script",
            globals: {
                Phaser: "readonly",
                document: "readonly",
                window: "readonly",
                fetch: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                IS_PREMIUM: "readonly",
                USERNAME: "readonly",
                CURRENT_WORLD: "readonly",
                WORLDS_UNLOCKED: "readonly",
                PLAYER_OC: "readonly",
                PLAYER_CC: "readonly",
                PLAYER_CS: "readonly",
                PLAYER_BM: "readonly",
                OBS_OC: "readonly",
                OBS_CC: "readonly",
                OBS_CS: "readonly",
                OBS_BM: "readonly",
                FINISH_OC: "readonly",
                FINISH_CC: "readonly",
                FINISH_CS: "readonly",
                FINISH_BM: "readonly"
            }
        },
        rules: {
            // giveUp() is intentionally global — it's called via
            // onclick="giveUp()" from game.html, not from within this file
            "no-unused-vars": ["warn", { varsIgnorePattern: "^giveUp$" }],
            "no-undef": "error",
            "eqeqeq": "warn",
            "no-var": "warn"
        }
    }
];