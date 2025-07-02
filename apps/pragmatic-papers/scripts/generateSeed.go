package main

import (
	"encoding/json"
	"os"
	"regexp"
	"text/template"
	"time"

	"github.com/jmoiron/sqlx"
	_ "github.com/mattn/go-sqlite3"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"fmt"
)

type volumeRow struct {
  ID           int       `json:"id" db:"id"`
  Title        string    `json:"title" db:"title"`
  VolumeNumber int       `json:"volume_number" db:"volume_number"`
  Description  string    `json:"description" db:"description"`
  EditorsNote  richtextData `json:"editors_note" db:"editors_note"`
  PublishedAt  time.Time `json:"published_at" db:"published_at"`
  Slug         string    `json:"slug" db:"slug"`
  SlugLock     int       `json:"slug_lock" db:"slug_lock"`
  UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
  CreatedAt    time.Time `json:"created_at" db:"created_at"`
  Status       string    `json:"_status" db:"_status"`
}

type richtextData struct {
  Root struct {
    Children []struct {
      Children *[]struct {
        Direction  string `json:"direction" db:"direction"`
        Format     *int `json:"format" db:"format"`
        Indent     int    `json:"indent" db:"indent"`
        Type       string `json:"type" db:"type"`
        Version    int    `json:"version" db:"version"`
        Tag        string `json:"tag,omitempty" db:"tag,omitempty"`
        TextFormat int    `json:"textFormat,omitempty" db:"textFormat,omitempty"`
        TextStyle  string `json:"textStyle,omitempty" db:"textStyle,omitempty"`
      } `json:"children" db:"children"`
      Direction  string `json:"direction" db:"direction"`
      Format     *int `json:"format" db:"format"`
      Indent     int    `json:"indent" db:"indent"`
      Type       string `json:"type" db:"type"`
      Version    int    `json:"version" db:"version"`
      Tag        string `json:"tag,omitempty" db:"tag,omitempty"`
      TextFormat int    `json:"textFormat,omitempty" db:"textFormat,omitempty"`
      TextStyle  string `json:"textStyle,omitempty" db:"textStyle,omitempty"`
    } `json:"children" db:"children"`
    Direction string `json:"direction" db:"direction"`
    Format    *int `json:"format" db:"format"`
    Indent    int    `json:"indent" db:"indent"`
    Type      string `json:"type" db:"type"`
    Version   int    `json:"version" db:"version"`
  } `json:"root" db:"root"`
}

func main()  {
  log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

  log.Info().Str("foo", "bar").Msg("Hello world")

  // open read-only database connection
  db, err := sqlx.Connect("sqlite3", "file:../pragmatic-papers.db?cache=shared&mode=ro")
  if err != nil {
    log.Fatal().Err(err).Msg("Failed to open database")
  }

  // Read the volume data from the volume table
  rows, err := db.Queryx("SELECT id, title, volume_number, description, editors_note, published_at, slug, slug_lock, updated_at, created_at, _status FROM volumes")
  if err != nil {
    log.Fatal().Err(err).Msg("Failed to query volume data")
  }

  defer rows.Close()
  var volumes []volumeRow
  for rows.Next() {
    var v volumeRow
    var editorsNoteData string
    var PublishedAt, UpdatedAt, CreatedAt string

    err := rows.Scan(&v.ID, &v.Title, &v.VolumeNumber, &v.Description, &editorsNoteData, &PublishedAt, &v.Slug, &v.SlugLock, &UpdatedAt, &CreatedAt, &v.Status)
    if err != nil {
      log.Fatal().Err(err).Msg("Failed to scan volume row")
    }

    v.PublishedAt, _ = time.Parse(time.RFC3339, PublishedAt)
    v.UpdatedAt, _ = time.Parse(time.RFC3339, UpdatedAt)
    v.CreatedAt, _ = time.Parse(time.RFC3339, CreatedAt)

    // regex replace string with string
    re := regexp.MustCompile(`:\"\"`)
    editorsNoteData = re.ReplaceAllString(editorsNoteData, ":null")

    err = json.Unmarshal([]byte(editorsNoteData), &v.EditorsNote)
    if err != nil {
      log.Fatal().Str("json", editorsNoteData).Err(err).Msg("Failed to unmarshal editors note data")
    }

    log.Info().Interface("volume", v).Msg("Volume data read")

    volumes = append(volumes, v)
  }
  for _, volume := range volumes {
    log.Info().Interface("volume", volume).Msg("Volume data")
  }

  for _, volume := range volumes {
    // output typescript code of the volume data using golang template
    // define a template string
    templateString := `
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    import { RequiredDataFromCollectionSlug } from 'payload'

    export const volume{{.ID}}: RequiredDataFromCollectionSlug<'volumes'> = () => {
      return {
        id: {{.ID}},
        title: "{{.Title}}",
        volumeNumber: {{.VolumeNumber}},
        description: "{{.Description}}",
        editorsNote: {
          root: {
            children: [{{range .EditorsNote.Root.Children}}
              {          children: [{{range .Children}}
                  {              direction: "{{.Direction}}",
                    format: {{if .Format}}{{.Format}}{{else}}null{{end}},
                  }{{if .Children}},{{end}}{{end}}]
                }{{if .Children}},{{end}}
              {{end}}
            ],
            direction: "{{.EditorsNote.Root.Direction}}",
            format: {{if .EditorsNote.Root.Format}}{{.EditorsNote.Root.Format}}{{else}}null{{end}},
            indent: {{.EditorsNote.Root.Indent}},
            type: "{{.EditorsNote.Root.Type}}",
            version: {{.EditorsNote.Root.Version}},
            {{if .EditorsNote.Root.Tag}}tag: "{{.EditorsNote.Root.Tag}}",{{end}}
            {{if .EditorsNote.Root.TextFormat}}textFormat: {{.EditorsNote.Root.TextFormat}},{{end}}
            {{if .EditorsNote.Root.TextStyle}}textStyle: "{{.EditorsNote.Root.TextStyle}}",{{end}}
          }
        }
      }
    }`

    // create a new template
    tmpl, err := template.New("volume").Parse(templateString)
    if err != nil {
      log.Fatal().Err(err).Msg("Failed to parse template")
    }
    // create a file to write the output
    fileName := "../src/endpoints/seed/volumes/volume" + fmt.Sprint(volume.ID) + ".ts"
    file, err := os.Create(fileName)
    if err != nil {
      log.Fatal().Err(err).Msg("Failed to create file")
    }


    err = tmpl.Execute(file, volume)
    if err != nil {
      log.Fatal().Err(err).Msg("Failed to execute template")
    }


    err = file.Close()
    if err != nil {
      log.Fatal().Err(err).Msg("Failed to close file")
    }
  }

  defer db.Close()
}
