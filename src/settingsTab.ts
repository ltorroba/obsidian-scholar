import { App, TFolder, Notice, PluginSettingTab, Setting } from "obsidian";

import {
	SETTING_HEADER,
	SETTING_NOTE_FOLDER_NAME,
	SETTING_NOTE_FOLDER_DESC,
	SETTING_NOTE_FOLDER_DEFAULT,
	SETTING_TEMPLATE_NAME,
	SETTING_TEMPLATE_DESC,
	SETTING_PDF_DOWNLOAD_NAME,
	SETTING_PDF_DOWNLOAD_DESC,
	SETTING_PDF_DOWNLOAD_FOLDER_DEFAULT,
	SETTING_IS_OPEN_PDF_WITH_NOTE_NAME,
	SETTING_IS_ADD_TO_BIB_FILE_NAME,
	SETTING_IS_ADD_TO_BIB_FILE_DESC,
	SETTING_ADD_TO_BIB_FILE_NAME,
	SETTING_ADD_TO_BIB_FILE_DESC,
	NOTICE_NOT_BIB_FILE,
	NOTICE_NO_BIB_FILE_SELECTED,
} from "./constants";

import ObsidianScholarPlugin from "./main";

// Settings
export interface ObsidianScholarPluginSettings {
	NoteLocation: string;
	fileNaming: string;
	templateFileLocation: string;
	pdfDownloadLocation: string;
	openPdfAfterDownload: boolean;
	saveBibTex: boolean;
	bibTexFileLocation: string;
}

export const DEFAULT_SETTINGS: ObsidianScholarPluginSettings = {
	NoteLocation: "",
	fileNaming: "",
	templateFileLocation: "",
	pdfDownloadLocation: "",
	openPdfAfterDownload: false,
	saveBibTex: false,
	bibTexFileLocation: "",
};

// Settings Tab
export class ObsidianScholarSettingTab extends PluginSettingTab {
	plugin: ObsidianScholarPlugin;

	constructor(app: App, plugin: ObsidianScholarPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: SETTING_HEADER });

		let folders = this.app.vault
			.getAllLoadedFiles()
			.filter((f) => f instanceof TFolder && f.path !== "/")
			.map((f) => f.path);

		let folderOptions: Record<string, string> = {};
		folders.forEach((record) => {
			folderOptions[record] = record;
		});
		folderOptions[""] = SETTING_NOTE_FOLDER_DEFAULT;

		// let namingOptions: Record<string, string> = {};
		// NAMING_TYPES.forEach((record) => {
		// 	namingOptions[record] = record;
		// });

		let files = this.app.vault.getMarkdownFiles().map((file) => file.path);
		let templateOptions: Record<string, string> = {};
		files.forEach((record) => {
			templateOptions[record] = record;
		});

		let pdfDownloadFolderOptions: Record<string, string> = {};
		folders.forEach((record) => {
			pdfDownloadFolderOptions[record] = record;
		});
		pdfDownloadFolderOptions[""] = SETTING_PDF_DOWNLOAD_FOLDER_DEFAULT;

		let allFiles = this.app.vault.getAllLoadedFiles().map((f) => f.path);
		let bibTexSaveOption: Record<string, string> = {};

		allFiles.forEach((record) => {
			bibTexSaveOption[record] = record;
		});
		bibTexSaveOption[""] = "";

		new Setting(containerEl)
			.setName(SETTING_NOTE_FOLDER_NAME)
			.setDesc(SETTING_NOTE_FOLDER_DESC)
			/* create dropdown menu with all folders currently in the vault */
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(folderOptions)
					.setValue(this.plugin.settings.NoteLocation)
					.onChange(async (value) => {
						this.plugin.settings.NoteLocation = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(SETTING_TEMPLATE_NAME)
			.setDesc(SETTING_TEMPLATE_DESC)
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(templateOptions)
					.setValue(this.plugin.settings.templateFileLocation)
					.onChange(async (value) => {
						this.plugin.settings.templateFileLocation = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(SETTING_PDF_DOWNLOAD_NAME)
			.setDesc(SETTING_PDF_DOWNLOAD_DESC)
			.addDropdown((dropdown) =>
				dropdown
					.addOptions(pdfDownloadFolderOptions)
					.setValue(this.plugin.settings.pdfDownloadLocation)
					.onChange(async (value) => {
						this.plugin.settings.pdfDownloadLocation = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(SETTING_IS_OPEN_PDF_WITH_NOTE_NAME)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.openPdfAfterDownload)
					.onChange(async (openPdfAfterDownload) => {
						this.plugin.settings.openPdfAfterDownload =
							openPdfAfterDownload;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName(SETTING_IS_ADD_TO_BIB_FILE_NAME)
			.setDesc(SETTING_IS_ADD_TO_BIB_FILE_DESC)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.saveBibTex)
					.onChange(async (saveBibTex) => {
						if (saveBibTex) {
							// Show command and another setting
							new Setting(containerEl)
								.setName(SETTING_ADD_TO_BIB_FILE_NAME)
								.setDesc(SETTING_ADD_TO_BIB_FILE_DESC)
								.addDropdown((dropdown) =>
									dropdown
										.addOptions(bibTexSaveOption)
										.setValue(
											this.plugin.settings
												.bibTexFileLocation
										)
										.onChange(async (value) => {
											// make sure the file is a .bib file
											if (!value.endsWith(".bib")) {
												new Notice(NOTICE_NOT_BIB_FILE);
											}
											if (
												value === "" ||
												value === undefined ||
												value === null
											) {
												new Notice(
													NOTICE_NO_BIB_FILE_SELECTED
												);
												return;
											}
											this.plugin.settings.bibTexFileLocation =
												value;
											this.plugin.settings.saveBibTex =
												saveBibTex;
											await this.plugin.saveSettings();
										})
								);
						} else {
							// Hide command and another setting
							this.plugin.settings.saveBibTex = saveBibTex;
							containerEl.removeChild(containerEl.lastChild!);
						}
					})
			);

		if (this.plugin.settings.saveBibTex) {
			new Setting(containerEl)
				.setName(SETTING_ADD_TO_BIB_FILE_NAME)
				.setDesc(SETTING_ADD_TO_BIB_FILE_DESC)
				.addDropdown((dropdown) =>
					dropdown
						.addOptions(bibTexSaveOption)
						.setValue(this.plugin.settings.bibTexFileLocation)
						.onChange(async (value) => {
							// make sure the file is a .bib file
							if (!value.endsWith(".bib")) {
								new Notice(NOTICE_NOT_BIB_FILE);
							}
							this.plugin.settings.bibTexFileLocation = value;
							await this.plugin.saveSettings();
						})
				);
		}
	}
}
