# a fencing duel?? 
##########################################
#               NEEDS:                   #
#   - Player + Enemy + ground            # 
#   - Custom Menu (att, def, parry)      #
#   - mechs (obvs)                       #
#                                        #
#                                        #
##########################################

# init 
Player = SpriteKind.player
Enemy = SpriteKind.enemy
UI = SpriteKind.create()

ground = sprites.create(assets.image("GROUND"))
ground.y += 25
p1 = sprites.create(assets.image("p1swU"), Player)
p2 = sprites.create(assets.image("p2swU"), Enemy)
p1.bottom = ground.top
p1.x -= 10
p2.bottom = ground.top
p2.x += 10
p1.set_flag(SpriteFlag.STAY_IN_SCREEN, True)
p2.set_flag(SpriteFlag.STAY_IN_SCREEN, True)
#ui creation
unselected_icons = [assets.image("SWICON"), assets.image("SHICON"), assets.image("PYICON")]
selected_icons = [assets.image("SWICONSL"), assets.image("SHICONSL"), assets.image("PYICONSL")]

p1warn = sprites.create(assets.image("temp"))
p1warn.set_position(10, 30)
p2warn = sprites.create(assets.image("temp"))
p2warn.set_position(150, 30)
p1warn.set_flag(SpriteFlag.INVISIBLE, True)
p2warn.set_flag(SpriteFlag.INVISIBLE, True)

ati = sprites.create(assets.image("SWICON"), UI)
ati.set_position(50, 105)
sprites.set_data_boolean(ati, "selected", True)
dei = sprites.create(assets.image("SHICON"), UI)
sprites.set_data_boolean(dei, "selected", False)
dei.set_position(80, 105)
pai = sprites.create(assets.image("PYICON"), UI)
sprites.set_data_boolean(pai, "selected", False)
pai.set_position(110, 105)

uicons = [ati, dei, pai]
selui = 0
def ui_update():
    n = 0
    for icon in sprites.all_of_kind(UI):
        
        if sprites.read_data_boolean(icon, "selected"):
            icon.set_image(selected_icons[n])
        else:
            icon.set_image(unselected_icons[n])
        n += 1
ui_update()

def ui_scroll_right():
    global selui
    selui += 1
    if selui >= len(uicons):
        selui = 0
        sprites.set_data_boolean(uicons[2], "selected", False)
    selicon = uicons[selui-1]
    nicon = uicons[selui]
    sprites.set_data_boolean(selicon, "selected", False)
    sprites.set_data_boolean(nicon, "selected", True)

    ui_update()
    console.log(selui)
controller.right.on_event(ControllerButtonEvent.PRESSED, ui_scroll_right)

def select():
    for icon in sprites.all_of_kind(UI):
        if sprites.read_data_boolean(icon, "selected"):
            action = icon
            break
    timer.background(eturn)
    if action == uicons[0]:
        attack()
        console.log("attack")
    elif action == uicons[1]:
        defend()
        console.log("defend")
    elif action  == uicons[2]:
        parry()
        console.log("parry")
    else:
        console.log("error")  
    warn()    


controller.A.on_event(ControllerButtonEvent.PRESSED, select)

def attack():
    sprites.set_data_string(p1, "action", "attack")
    story.sprite_move_to_location(p1, p1.x+20, p1.y, 100)
    p1.set_image(assets.image("p1swD"))

def defend():
    sprites.set_data_string(p1, "action", "defend")
    story.sprite_move_to_location(p1, p1.x-20, p1.y, 100)
    p1.set_image(assets.image("p1swU"))

def parry():
    sprites.set_data_string(p1, "action", "parry")
    p1.set_image(assets.image("p1swU"))

def eturn(): # add a check for being too close to the back wall
    choice = randint(1,3)
    if choice == 1:
        sprites.set_data_string(p2, "action", "attack")
        story.sprite_move_to_location(p2, p2.x-20, p1.y, 100)
        p2.set_image(assets.image("p2swD"))
    elif choice == 2:
        if p2.x+20 >= 160: 
            console.log_value("Wall Hit", p2.x+20)
            eturn()
        else:
            sprites.set_data_string(p2, "action", "defend")
            story.sprite_move_to_location(p2, p2.x+20, p1.y, 100)
            p2.set_image(assets.image("p2swU"))
    elif choice == 3:
        sprites.set_data_string(p2, "action", "parry")
        p2.set_image(assets.image("p2swU"))

def clash(player: Sprite, enemy: Sprite):
    if sprites.read_data_string(player, "action") == "attack" and sprites.read_data_string(enemy, "action") == "attack":
        story.cancel_sprite_movement(enemy)    
        story.cancel_sprite_movement(player)
        def move_back():
            story.sprite_move_to_location(p2, p2.x+20, p1.y, 100)
        timer.background(move_back)
        story.sprite_move_to_location(p1, p1.x-20, p1.y, 100)
    elif sprites.read_data_string(player, "action") == "parry":
        story.cancel_sprite_movement(enemy)
        p2_parried()
    elif sprites.read_data_string(enemy, "action") == "parry":
            story.cancel_sprite_movement(player)
            p1_parried()
events.sprite_event(Player, Enemy, events.SpriteEvent.START_OVERLAPPING, clash)

def p1_parried():
    story.sprite_move_to_location(p1, p1.x-40, p1.y, 200)

def p2_parried():
    story.sprite_move_to_location(p2, p2.x+40, p1.y, 200)


def p1_loss(sprite):
    game.game_over(False)


def p2_loss(sprite):
    game.game_over(True)


spriteutils.on_sprite_of_kind_hits_edge_of_screen(Player, p1_loss)
spriteutils.on_sprite_of_kind_hits_edge_of_screen(Enemy, p2_loss)

def warn():
    if p1.x <= 20:
        p1warn.set_flag(SpriteFlag.INVISIBLE, False)
        animation.run_image_animation(p1warn, assets.animation("EDGE WARN"), 500, True)
    else:
        p1warn.set_flag(SpriteFlag.INVISIBLE, True)
    if p2.x >= 140:
        p2warn.set_flag(SpriteFlag.INVISIBLE, False)
        animation.run_image_animation(p2warn, assets.animation("EDGE WARN"), 500, True)
    else:
        p2warn.set_flag(SpriteFlag.INVISIBLE, True)
