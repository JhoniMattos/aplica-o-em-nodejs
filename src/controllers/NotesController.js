const knex = require("../database/knex")

class NotesController {
  async create(request, response) {
    const { title, description, tags, links } = request.body
    const { user_id } = request.params

    const [note_id] = await knex("movies_notes").insert({
      title,
      description,
      user_id
    })

    const linksInsert = links.map(link => {
      return {
        note_id,
        url: link
      }
    })

    await knex("movies_links").insert(linksInsert)

    const tagsInsert = tags.map(name => {
      return {
        note_id,
        name,
        user_id
      }
    })

    await knex("movies_tags").insert(tagsInsert)

    response.json()
  }

  async show(request, response) {
    const { id } = request.params

    const note = await knex("movies_notes").where({ id }).first()
    const tags = await knex("movies_tags").where({ note_id: id }).orderBy("name")
    const links = await knex("movies_links").where({ note_id: id}).orderBy("created_at")

    return response.json({
      ...note,
      tags,
      links
    })
  } 

  async delete(request, response) {
    const { id } = request.params

    await knex("movies_notes").where({ id }).delete()

    return response.json()
  }

  async index(request, response) {
    const { title, user_id, tags } = request.query

    let notes;

    if(tags) {
      const filterTags = tags.split(',').map(tag => tag.trim())

      notes = await knex("movies_tags")
      .select([
        "movies_notes.id",
        "movies_notes.title",
        "movies_notes.user_id",
      ])
      .where("movies_notes.user_id", user_id)
      .whereLike("movies_notes.title", `%${title}%`)
      .whereIn("name", filterTags)
      .innerJoin("movies_notes", "movies_notes.id", "movies_tags.note_id")
      .orderBy("movies_notes.title")

    }else {

    const notes = await knex("movies_notes")
    .where({ user_id })
    .whereLike("title", `%${title}%`)
    .orderBy("title")
    }

    const userTags = await knex("movies_tags").where({ user_id })
    const notesWithTags = notes.map(note => {
      const noteTags = userTags.filter(tag => tag.note_id === note.id)

      return {
        ...movies_notes,
        tags: noteTags
      }
    })
    
    return response.json(notesWithTags)
  }
}

module.exports = NotesController;