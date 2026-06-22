//  a fencing duel?? 
// #########################################
//                NEEDS:                   #
//    - Player + Enemy + ground            # 
//    - Custom Menu (att, def, parry)      #
//    - mechs (obvs)                       #
//                                         #
//                                         #
// #########################################
//  init 
let Player = SpriteKind.Player
let Enemy = SpriteKind.Enemy
let UI = SpriteKind.create()
let ground = sprites.create(assets.image`GROUND`)
ground.y += 25
let p1 = sprites.create(assets.image`p1swU`, Player)
let p2 = sprites.create(assets.image`p2swU`, Enemy)
p1.bottom = ground.top
p1.x -= 10
p2.bottom = ground.top
p2.x += 10
p1.setFlag(SpriteFlag.StayInScreen, true)
p2.setFlag(SpriteFlag.StayInScreen, true)
// ui creation
let unselected_icons = [assets.image`SWICON`, assets.image`SHICON`, assets.image`PYICON`]
let selected_icons = [assets.image`SWICONSL`, assets.image`SHICONSL`, assets.image`PYICONSL`]
let p1warn = sprites.create(assets.image`temp`)
p1warn.setPosition(10, 30)
let p2warn = sprites.create(assets.image`temp`)
p2warn.setPosition(150, 30)
p1warn.setFlag(SpriteFlag.Invisible, true)
p2warn.setFlag(SpriteFlag.Invisible, true)
let ati = sprites.create(assets.image`SWICON`, UI)
ati.setPosition(50, 105)
sprites.setDataBoolean(ati, "selected", true)
let dei = sprites.create(assets.image`SHICON`, UI)
sprites.setDataBoolean(dei, "selected", false)
dei.setPosition(80, 105)
let pai = sprites.create(assets.image`PYICON`, UI)
sprites.setDataBoolean(pai, "selected", false)
pai.setPosition(110, 105)
let uicons = [ati, dei, pai]
let selui = 0
function ui_update() {
    let n = 0
    for (let icon of sprites.allOfKind(UI)) {
        if (sprites.readDataBoolean(icon, "selected")) {
            icon.setImage(selected_icons[n])
        } else {
            icon.setImage(unselected_icons[n])
        }
        
        n += 1
    }
}

ui_update()
controller.right.onEvent(ControllerButtonEvent.Pressed, function ui_scroll_right() {
    
    selui += 1
    if (selui >= uicons.length) {
        selui = 0
        sprites.setDataBoolean(uicons[2], "selected", false)
    }
    
    let selicon = uicons[selui - 1]
    let nicon = uicons[selui]
    sprites.setDataBoolean(selicon, "selected", false)
    sprites.setDataBoolean(nicon, "selected", true)
    ui_update()
    console.log(selui)
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function select() {
    let action: Sprite;
    for (let icon of sprites.allOfKind(UI)) {
        if (sprites.readDataBoolean(icon, "selected")) {
            action = icon
            break
        }
        
    }
    timer.background(eturn)
    if (action == uicons[0]) {
        attack()
        console.log("attack")
    } else if (action == uicons[1]) {
        defend()
        console.log("defend")
    } else if (action == uicons[2]) {
        parry()
        console.log("parry")
    } else {
        console.log("error")
    }
    
    warn()
})
function attack() {
    sprites.setDataString(p1, "action", "attack")
    story.spriteMoveToLocation(p1, p1.x + 20, p1.y, 100)
    p1.setImage(assets.image`p1swD`)
}

function defend() {
    sprites.setDataString(p1, "action", "defend")
    story.spriteMoveToLocation(p1, p1.x - 20, p1.y, 100)
    p1.setImage(assets.image`p1swU`)
}

function parry() {
    sprites.setDataString(p1, "action", "parry")
    p1.setImage(assets.image`p1swU`)
}

function eturn() {
    //  add a check for being too close to the back wall
    let choice = randint(1, 3)
    if (choice == 1) {
        sprites.setDataString(p2, "action", "attack")
        story.spriteMoveToLocation(p2, p2.x - 20, p1.y, 100)
        p2.setImage(assets.image`p2swD`)
    } else if (choice == 2) {
        if (p2.x + 20 >= 160) {
            console.logValue("Wall Hit", p2.x + 20)
            eturn()
        } else {
            sprites.setDataString(p2, "action", "defend")
            story.spriteMoveToLocation(p2, p2.x + 20, p1.y, 100)
            p2.setImage(assets.image`p2swU`)
        }
        
    } else if (choice == 3) {
        sprites.setDataString(p2, "action", "parry")
        p2.setImage(assets.image`p2swU`)
    }
    
}

events.spriteEvent(Player, Enemy, events.SpriteEvent.StartOverlapping, function clash(player: Sprite, enemy: Sprite) {
    if (sprites.readDataString(player, "action") == "attack" && sprites.readDataString(enemy, "action") == "attack") {
        story.cancelSpriteMovement(enemy)
        story.cancelSpriteMovement(player)
        timer.background(function move_back() {
            story.spriteMoveToLocation(p2, p2.x + 20, p1.y, 100)
        })
        story.spriteMoveToLocation(p1, p1.x - 20, p1.y, 100)
    } else if (sprites.readDataString(player, "action") == "parry") {
        story.cancelSpriteMovement(enemy)
        p2_parried()
    } else if (sprites.readDataString(enemy, "action") == "parry") {
        story.cancelSpriteMovement(player)
        p1_parried()
    }
    
})
function p1_parried() {
    story.spriteMoveToLocation(p1, p1.x - 40, p1.y, 200)
}

function p2_parried() {
    story.spriteMoveToLocation(p2, p2.x + 40, p1.y, 200)
}

spriteutils.onSpriteOfKindHitsEdgeOfScreen(Player, function p1_loss(sprite: Sprite) {
    game.gameOver(false)
})
spriteutils.onSpriteOfKindHitsEdgeOfScreen(Enemy, function p2_loss(sprite: Sprite) {
    game.gameOver(true)
})
function warn() {
    if (p1.x <= 20) {
        p1warn.setFlag(SpriteFlag.Invisible, false)
        animation.runImageAnimation(p1warn, assets.animation`EDGE WARN`, 500, true)
    } else {
        p1warn.setFlag(SpriteFlag.Invisible, true)
    }
    
    if (p2.x >= 140) {
        p2warn.setFlag(SpriteFlag.Invisible, false)
        animation.runImageAnimation(p2warn, assets.animation`EDGE WARN`, 500, true)
    } else {
        p2warn.setFlag(SpriteFlag.Invisible, true)
    }
    
}

