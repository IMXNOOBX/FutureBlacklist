import discord
from discord import app_commands
import mysql.connector

adm_user_id = '652969127756955658'

# con = mysql.connector.connect(
#   host="localhost",
#   user="Future5",
#   password="GNB82hBjtA54P8ey",
#   database="future5"
# )

intents = discord.Intents.default()
client = discord.Client(command_prefix="!", help_command=None, intents=intents, guild_ids=[749963611807547442])
tree = app_commands.CommandTree(client)

@client.event
async def on_ready():
    await tree.sync()
    await client.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name="a movie")) # https://stackoverflow.com/a/59126629/15384495
    print("bot Ready!")


@tree.command(name="help", description="Some help about this bot.")
async def help_command(interaction):
    await interaction.response.send_message("Hello!")

@tree.command(name="status", description="Get bot status.")
async def status_command(interaction):
    await interaction.response.send_message("Status!")


key_group = app_commands.Group(
    name="key", description="API Key related commands. (Owner only)")


@key_group.command(name="generate", description="Generate api key for a new user")
async def apikey_command(interaction):
    await interaction.response.send_message("You executed the slash command!", ephemeral=True)

client.run(
    'MTA0MzMxNDk1NDE4MDIzOTQ1Ng.G1ND_r.QoMsQBpwlNoZ39dAwBuLnslQ4ribggVgQkLqIc')
