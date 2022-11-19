import discord
from discord import app_commands
from discord.ext import commands
# from discord.commands.context import ApplicationContext
# from discord.commands import Option
import mysql.connector

bot = commands.Bot(command_prefix="!")

con = mysql.connector.connect(
  host="localhost",
  user="Future5",
  password="GNB82hBjtA54P8ey",
  database="future5"
)

adm_user_id = '652969127756955658'

@bot.slash_command(name="first_slash")
async def first_slash(ctx): 
    await ctx.respond("You executed the slash command!")


# @bot.slash_command(name="genkey", description= "Generate api key for a new user")
# async def first_slash(
# 	ctx: discord.ApplicationContext,
#     name: Option(str, "Enter your name")
# 	): 
#     await ctx.respond("You executed the slash command!")

bot.run('MTA0MzMxNDk1NDE4MDIzOTQ1Ng.G1ND_r.QoMsQBpwlNoZ39dAwBuLnslQ4ribggVgQkLqIc')