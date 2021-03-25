"use strict";

/*
 * Created with @iobroker/create-adapter v1.32.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");
const auth = require(__dirname + "/lib/auth.js");
const request = require("request");

// Load your modules here, e.g.:
// const fs = require("fs");

class SunnyportalApi extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "sunnyportal-api",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		this.log.info("SunnyPortal User: " + this.config.client_id);

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
		await this.setObjectNotExistsAsync("connection.AuthCode", {
			type: "state",
			common: {
				name: "AuthCode",
				type: "string",
				role: "indicator",
				read: true,
				write: false,
			},
			native: {},
		});

		await this.setObjectNotExistsAsync("connection.AccessToken", {
                        type: "state",
                        common: {
                                name: "AccessToken",
                                type: "string",
                                role: "indicator",
                                read: true,
                                write: false,
                        },
                        native: {},
                });
		
		await this.setObjectNotExistsAsync("connection.RefreshToken", {
                        type: "state",
                        common: {
                                name: "RefreshToken",
                                type: "string",
                                role: "indicator",
                                read: true,
                                write: false,
                        },
                        native: {},
                });

		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		//this.subscribeStates("testVariable");
		// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
		// this.subscribeStates("lights.*");
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		this.subscribeStates("*");

		/*
			setState examples
			you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		////await this.setStateAsync("testVariable", true);

		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		////await this.setStateAsync("testVariable", { val: true, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		await this.setStateAsync("connection.AuthCode", { val: "Ein Wert", ack: true });
		await this.setStateAsync("connection.AccessToken", { val: "Ein Wert 1", ack: true });
		await this.setStateAsync("connection.RefreshToken", { val: "Ein Wert 2", ack: true });


		// examples for the checkPassword/checkGroup functions
		////let result = await this.checkPasswordAsync("admin", "iobroker");
		////this.log.info("check user admin pw iobroker: " + result);

		////result = await this.checkGroupAsync("admin", "admin");
		////this.log.info("check group user admin group admin: " + result);
		
		this.getAuthCode()
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.debug(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.debug(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }
	
	async getAuthCode(){

		auth.authRequest(this.config.client_id, this.config.client_secret)
			.then(
				(authCode, state) => {
					this.setStateAsync("connection.AuthCode", { val: authCode, ack: true });
				},
				(statusPost) => {
        	adapter.log.error("Error AuthUriGet: " + statusPost);
        }
			)
			.catch(() => {
	    	adapter.log.debug("auth uri not successfull");
			});

	}

}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new SunnyportalApi(options);
} else {
	// otherwise start the instance directly
	new SunnyportalApi();
}
