
const {
    Client,
    GatewayIntentBits,
    discordSort,
    ApplicationCommandOptionType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    Embed,
    Collector,
    Events,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    PermissionsBitField,
    ActivityType,
    AuditLogEvent
  } = require('discord.js');
const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildInvites,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageTyping,
      GatewayIntentBits.GuildPresences
    ],
  });
const { token, staffRoleId, guildId, seniorManagementRoleId, executiveBoardRoleId, RyanairStaffSelect, SeniorManagement, ExecutiveBoard, mangementRoleId, Management } = require('./config.json'); // Store your token and IDs in a config.json file


const guild = client.guilds.cache.get(guildId)



client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({ 
      activities: [{ 
          name: 'Low Fares. Great Care.', 
          type: ActivityType.Custom, 
      }], 
      status: 'online' 
  });
    let commands
    if (guild) {
      commands = guild.commands
  
    } else {
      commands = client.application?.commands
  
    }
    commands?.create({
      name: 'purge',
      description: 'Delete bulk message',
      options: [{
        name: 'amount',
        type: ApplicationCommandOptionType.Number,
        description: 'Amount of message you want to delete',
        required: true
      }]
    });
    commands?.create({
      name: 'announce',
      description: 'Announcing message',
      options: [{
        name: 'channel',
        type: ApplicationCommandOptionType.Channel,
        description: 'Choose the channel to send the message',
        required: true
      },{
        name: 'type',
        type: ApplicationCommandOptionType.String,
        description: 'Embeds or normal text',
        required: true,
        choices:[
        { name: 'Text', value: 'text_based' },
				{ name: 'Embed', value: 'embed_based' },
        ]
      }]
    });
   
  
  });
  
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() && !interaction.isModalSubmit()){return;}

    const { commandName, options } = interaction;
    

      
    
    if (commandName === 'announce'){
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages) && interaction.user.id !== '927820005733728316') {
        return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
    }
      const choice = interaction.options.getString('type');
      const channelId = interaction.options.getChannel('channel').id;
      const channel = await client.channels.fetch(channelId);
      const embedModal = new ModalBuilder()
        .setCustomId('announceDataEmbed')
        .setTitle('What to put in your announcement');
  
      const textModal = new ModalBuilder()
        .setCustomId('announceDataText')
        .setTitle('What to put in your announcement');
  
      const titleInput = new TextInputBuilder()
        .setCustomId('title')
        .setLabel('Set a title for the embed')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(100);
  
      const descriptionInput = new TextInputBuilder()
        .setCustomId('description')
        .setLabel('Set a description for your embed')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
        .setMaxLength(2000);
  
      const imageInput = new TextInputBuilder()
        .setCustomId('image')
        .setLabel('Input image URL or leave blank if no image')
        .setRequired(false)
        .setMaxLength(1000)
        .setStyle(TextInputStyle.Short);
  
      const colorInput = new TextInputBuilder()
        .setCustomId('color')
        .setLabel('Set color (Hex, default: White)')
        .setRequired(false)
        .setMaxLength(50)
        .setStyle(TextInputStyle.Short);
        const channelIdInput = new TextInputBuilder()
        .setCustomId('channelId')
        .setLabel('Channel ID (Default as the command)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setValue(channelId)
        .setPlaceholder('DO NOT TOUCH')
        
        
      if (choice === 'embed_based') {
        embedModal.addComponents(
          new ActionRowBuilder().addComponents(titleInput),
          new ActionRowBuilder().addComponents(descriptionInput),
          new ActionRowBuilder().addComponents(imageInput),
          new ActionRowBuilder().addComponents(colorInput),
          new ActionRowBuilder().addComponents(channelIdInput),
        );
  
        await interaction.showModal(embedModal);
      } else {
        textModal.addComponents(
          new ActionRowBuilder().addComponents(descriptionInput),
          new ActionRowBuilder().addComponents(imageInput),
          new ActionRowBuilder().addComponents(channelIdInput),
        );
  
        await interaction.showModal(textModal);
      }
      
      
        
     
        
    }
    
    if (interaction.customId === 'announceDataEmbed') {
      
      const title = interaction.fields.getTextInputValue('title');
      const description = interaction.fields.getTextInputValue('description')
      const image = interaction.fields.getTextInputValue('image') || false;
      const color = interaction.fields.getTextInputValue('color') || '#FFFFFF';
      const channelId = interaction.fields.getTextInputValue('channelId')
      const channel = await client.channels.fetch(channelId);
      
      const embed = new EmbedBuilder()
      
        
        .setColor(color);
      if (title){
        embed.setTitle(title)
      }
      if (image) {
        embed.setImage(image);
      }
      if (description){
        embed.setDescription(description)
      }

      try {
        await channel.send({ embeds: [embed] });
        
      } catch (e) {
      
      }
    } else if (interaction.customId === 'announceDataText') {
      const description = interaction.fields.getTextInputValue('description');
      const image = interaction.fields.getTextInputValue('image');
      const channelId = interaction.fields.getTextInputValue('channelId')
      const channel = await client.channels.fetch(channelId);
      try {
        await channel.send(`${description ? description : ''}\n${image ? image : ''}`);

      } catch (e) {
      
      }
    }

    if (commandName === 'purge') {
      
        const amount = options.getNumber('amount');

        // Check if the user has permission to manage messages
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        // Ensure the amount is valid
        if (amount < 1 || amount > 1000) {
            return interaction.reply({ content: 'You need to input a number between 1 and 1000.', ephemeral: true });
        }

        let deletedMessages = 0;
        while (deletedMessages < amount) {
            const messagesToDelete = Math.min(amount - deletedMessages, 100);

            try {
                const deleted = await interaction.channel.bulkDelete(messagesToDelete, true); // true to filter out messages older than 14 days
                deletedMessages += deleted.size;
            } catch (err) {
                console.error(err);
                return interaction.reply({ content: 'There was an error trying to delete messages in this channel!', ephemeral: true });
            }
        }
        interaction.reply({ content: `Successfully deleted ${deletedMessages} messages.`, ephemeral: true });
    }
});
client.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  const oldRoles = oldMember.roles.cache.map(role => role.id);
  const newRoles = newMember.roles.cache.map(role => role.id);

  const addedRoles = newRoles.filter(role => !oldRoles.includes(role));


  if (addedRoles.length > 0) {
      const auditLogs = await newMember.guild.fetchAuditLogs({
          limit: 1,
          type: AuditLogEvent.MemberRoleUpdate,
      });
      const roleLog = auditLogs.entries.first();
      if (roleLog && roleLog.target.id === newMember.id) {
          const executor = roleLog.executor.tag;
          const addedRoleNames = addedRoles.map(roleId => newMember.guild.roles.cache.get(roleId)?.name).filter(Boolean).join(', ');
          console.log(`${executor} gave ${newMember.user.tag} the following role(s): ${addedRoleNames}`);
          const member = await newMember.guild.members.fetch(newMember.user.id);
          const role = await newMember.guild.roles.fetch(staffRoleId);
          try{
            if (member && role) {
              if (RyanairStaffSelect.includes(addedRoleNames)){
                await member.roles.add(staffRoleId);
                console.log('Staff role add to user')
              }
              if(SeniorManagement.includes(addedRoleNames)){
                await member.roles.add(seniorManagementRoleId);
              console.log('Staff#2 role add to user')
              }else if (ExecutiveBoard.includes(addedRoleNames)){
                await member.roles.add(executiveBoardRoleId);
              console.log('Staff#3 role add to user')
              } else if (Management.includes(addedRoleNames)){
                await member.roles.add(mangementRoleId);
              console.log('Staff#4 role add to user')
              }
              
              
          } else {
              console.log('Not meet the requirements')
          }
          }catch (e){
            console.log(e)
          }
          
      }
  }

  
});
client.login(token);
