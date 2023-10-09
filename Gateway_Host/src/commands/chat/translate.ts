import { SlashCommandBuilder, Interaction, PermissionFlagsBits, SlashCommandStringOption, SlashCommandBooleanOption } from 'discord.js';
import { ClientData } from '../../resources/structures';
import { translate } from 'free-translate';
import { Locale } from 'free-translate/dist/types/locales';
import chalk from 'chalk';

import i18next from 'i18next';

export default {
	commandName: 'translate',
	cooldown: 15,
	guilds: null,
	data: new SlashCommandBuilder()
		.setNSFW(false)
		.setDMPermission(true)
		.setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
		.setName('translate')
		.setDescription(i18next.t('cmd.slash.translate.description', { lng: 'en' }))
		.setDescriptionLocalizations({
			'en-GB': i18next.t('cmd.slash.translate.description', { lng: 'en-GB' }),
			'en-US': i18next.t('cmd.slash.translate.description', { lng: 'en-US' }),
			'de': i18next.t('cmd.slash.translate.description', { lng: 'de' }),
			'ru': i18next.t('cmd.slash.translate.description', { lng: 'ru' }),
			"es-ES": i18next.t('cmd.slash.translate.description', { lng: 'es-ES' })
		})
		.addStringOption((option: SlashCommandStringOption) =>
			option.setName('content')
				.setDescription('Specify the content I should translate.')
				.setRequired(true))
		.addStringOption((option: SlashCommandStringOption) =>
			option.setName('language')
				.setDescription('Specify the language I should translate the content to.')
				.setRequired(true)
				.addChoices(
					{ name: 'Deutsch', value: 'de' },
					{ name: 'English (British)', value: 'en-GB' },
					{ name: 'English (United States)', value: 'en-US' },
					{ name: 'Español', value: 'es-ES' },
					{ name: 'Русский', value: 'ru' },
				))
		.addBooleanOption((option: SlashCommandBooleanOption) =>
			option.setName('public')
				.setDescription('Specify if this message should be sent to everyone in this channel.')),

	async execute(client: ClientData, interaction: Interaction) {

		if (!interaction.isChatInputCommand()) return;

		await interaction.deferReply({ ephemeral: !interaction.options.getBoolean('public') ?? false });

		try {
			const content = interaction.options.getString('content');
			const selectedLanguage = interaction.options.getString('language');

			if (content == null) {
				interaction.editReply({ content: 'You must specify the content I should translate!' });
				return;
			}
			else {
				if (selectedLanguage == null) {
					interaction.editReply({ content: 'You must specify the language I should translate the content to!' });
					return;
				}
			}

			console.log(content!, interaction.locale!, selectedLanguage!);

			const result = await translate(
				content!,
				{
					from: interaction.locale as Locale,
					to: selectedLanguage as Locale
				}
			);

			await interaction.editReply({ content: `${result}` });

		} catch (err: any) {
			console.error(chalk.redBright(err.stack));
			await interaction.editReply({ content: `There was an error while executing this command!` });
		}
	},
};