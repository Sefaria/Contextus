import React, { useContext }  from 'react';
import classNames  from 'classnames';
import PropTypes  from 'prop-types';
import Sefaria  from './sefaria/sefaria';
import { ContentLanguageContext } from './context';
import { NavSidebar } from './NavSidebar';
import Footer  from './Footer';
import ComparePanelHeader from './ComparePanelHeader';
import {
  CategoryAttribution,
  CategoryColorLine,
  ResponsiveNBox,
  LanguageToggleButton,
  InterfaceText,
  ContentText,
} from './Misc';


// Navigation Menu for a single category of texts (e.g., "Tanakh", "Bavli")
const ReaderNavigationCategoryMenu = ({category, categories, setCategories, toggleLanguage,
  openDisplaySettings, onCompareBack, openTextTOC, multiPanel, initialWidth, compare }) => {

  // Show Talmud with Toggles
  const cats  = categories[0] === "Talmud" && categories.length === 1 ?
                      ["Talmud", "Bavli"]
                      : (categories[0] === "Tosefta" && categories.length === 1) ?
                      ["Tosefta", "Vilna Edition"]
                      : categories;
  const aboutCats = categories[0] === "Talmud" && categories.length === 2 ?
                      ["Talmud"] : categories;
  
  let catTitle = '', heCatTitle = '';

  if ((cats[0] === "Talmud" || cats[0] === "Tosefta") && cats.length === 2) {
    category   = cats[0]; 
    catTitle   = cats[0];
    heCatTitle = Sefaria.hebrewTerm(cats[0]);
  } else {
    if (category === "Commentary") {
      const onCat = cats.slice(-2)[0];
      catTitle   = onCat + " Commentary";
      heCatTitle = Sefaria.hebrewTerm(onCat) + " " + Sefaria.hebrewTerm("Commentary");
    } else {
      catTitle   = category;
      heCatTitle = Sefaria.hebrewTerm(category);
    }
  }

  const tocObject = Sefaria.tocObjectByCategories(cats);

  const catContents = Sefaria.tocItemsByCategories(cats);
  const nestLevel   = category === "Commentary" ? 1 : 0;
  const aboutModule = [
    multiPanel ? {type: "AboutTextCategory", props: {cats: aboutCats}} : {type: null},
  ];

  const sidebarModules = aboutModule.concat(getSidebarModules(cats));

  const categoryToggle = <TalmudToggle categories={cats} setCategories={setCategories} /> || 
                          <ToseftaToggle categories={cats} setCategories={setCategories} />;
  
  const title = compare ? categoryToggle :
    <div className="navTitle">
      <h1>
        <ContentText text={{en: catTitle, he: heCatTitle}} defaultToInterfaceOnBilingual={true} />
      </h1>
      {categoryToggle}
      {multiPanel && Sefaria.interfaceLang !== "hebrew"  && Sefaria._siteSettings.TORAH_SPECIFIC ? 
      <LanguageToggleButton toggleLanguage={toggleLanguage} /> : null }
    </div>;

  const comparePanelHeader = compare ? (
    <ComparePanelHeader
      category={cats[0]}
      openDisplaySettings={openDisplaySettings}
      onBack={() => setCategories(aboutCats.slice(0, -1))}
      catTitle={catTitle}
      heCatTitle={heCatTitle} />
  ) : null;

  const footer         = compare ? null : <Footer />;
  const navMenuClasses = classNames({readerNavCategoryMenu: 1, readerNavMenu: 1, noLangToggleInHebrew: 1, compare: compare});
  return (
    <div className={navMenuClasses}>
      <CategoryColorLine category={categories[0]} />
      { comparePanelHeader }
      <div className="content">
        <div className="sidebarLayout">
          <div className="contentInner followsContentLang">
            { title }
            {!multiPanel ? 
            <div className="categoryDescription top">
              <ContentText text={{en: tocObject.enDesc, he: tocObject.heDesc}} defaultToInterfaceOnBilingual={true} />
            </div> : null}
            <CategoryAttribution categories={cats} asEdition={true} />
            <ReaderNavigationCategoryMenuContents
              contents={catContents}
              categories={cats}
              category={category}
              setCategories={setCategories}
              openTextTOC={openTextTOC}
              initialWidth={initialWidth}
              nestLevel={nestLevel} />
          </div>
          {!compare ? <NavSidebar modules={sidebarModules} /> : null}
        </div>
        {footer}
      </div>
    </div>
  );
};
ReaderNavigationCategoryMenu.propTypes = {
  category:            PropTypes.string.isRequired,
  categories:          PropTypes.array.isRequired,
  setCategories:       PropTypes.func.isRequired,
  toggleLanguage:      PropTypes.func.isRequired,
  openDisplaySettings: PropTypes.func.isRequired,
  initialWidth:        PropTypes.number,
  compare:             PropTypes.bool,
};


// Inner content of Category menu (just category title and boxes of texts/subcategories)
const ReaderNavigationCategoryMenuContents = ({category, contents, categories, 
  setCategories, openTextTOC, initialWidth, nestLevel}) =>  {
  const content = [];
  const cats = categories || [];
  const contentLang = useContext(ContentLanguageContext).language;
  const sortedContents = contentLang === "hebrew" ? hebrewContentSort(contents) : contents;

  for (const item of sortedContents) {

    if (item.category) {
      // Category
      const newCats = cats.concat(item.category);

      // Special Case categories which should nest but normally wouldn't given their depth   ["Mishneh Torah", "Shulchan Arukh", "Tur"]
      if (item.isPrimary || nestLevel > 0) {

        // There's just one text in this category, render the text.
        if(item.contents && item.contents.length === 1 && !("category" in item.contents[0])) {
          const chItem = item.contents[0];
          if (chItem.hidden) { continue; }
          const onClick = e => {
            if (openTextTOC) {
              e.preventDefault();
              openTextTOC(item.title);
            }
          };
          content.push(
            <TextMenuItem
              item={chItem}
              categories={categories}
              onClick={onClick}
              nestLevel={nestLevel} />
          );

        // Create a link to a subcategory
        } else {
          content.push((
            <MenuItem
              href        = {"/texts/" + newCats.join("/")}
              onClick     = {(e) => {e.preventDefault(); setCategories(newCats)}}
              cats        = {newCats}
              title       = {item.category}
              heTitle     = {item.heCategory}
              enDesc      = {item.enShortDesc}
              heDesc      = {item.heShortDesc}
            />
          ));
        }

      // Add a nested subcategory
      } else {
        let shortDesc = contentLang === "hebrew" ? item.heShortDesc : item.enShortDesc;
        const hasDesc  = !!shortDesc;
        const longDesc = hasDesc && shortDesc.split(" ").length > 5;
        shortDesc = hasDesc && !longDesc ? `(${shortDesc})` : shortDesc;

        content.push(
          <div className='category' key={"cat." + nestLevel + "." + item.category}>
            <h2>
              <ContentText text={{en: item.category, he: item.heCategory}} defaultToInterfaceOnBilingual={true} />
              {hasDesc && !longDesc ? 
              <span className="categoryDescription">
                <ContentText text={{en: shortDesc, he: shortDesc}} defaultToInterfaceOnBilingual={true} />
              </span> : null }
            </h2>
            {hasDesc && longDesc ? 
            <div className="categoryDescription long sans-serif">
              <ContentText text={{en: shortDesc, he: shortDesc}} defaultToInterfaceOnBilingual={true} />
            </div> : null }
            <ReaderNavigationCategoryMenuContents
              contents      = {item.contents}
              categories    = {newCats}
              category      = {item.category}
              setCategories = {setCategories}
              openTextTOC   = {openTextTOC}
              initialWidth  = {initialWidth}
              nestLevel     = {nestLevel + 1} />
          </div>
        );
      }

    // Add a Collection
    } else if (item.isCollection) {
        content.push(
          <MenuItem
            href        = {"/collections/" + item.slug}
            nestLevel   = {nestLevel}
            title       = {item.title}
            heTitle     = {item.heTitle}
            enDesc      = {item.enShortDesc}
            heDesc      = {item.heShortDesc} />
        );

    // Skip hidden texts
    } else if (item.hidden) {
        continue;

    // Add a Text
    } else {
        const onClick = e => {
          if (openTextTOC) {
            e.preventDefault();
            openTextTOC(item.title);
          }
        };
        content.push((
          <TextMenuItem 
            item={item}
            categories={categories}
            onClick={onClick}
            nestLevel={nestLevel} />
        ));
    }
  }

  const boxedContent = [];
  let currentRun   = [];
  let i;
  for (i = 0; i < content.length; i++) {
    // Walk through content looking for runs of texts/subcats to group together into a table
    if (content[i].type === "div") { // this is a subcategory
      if (currentRun.length) {
        boxedContent.push((<ResponsiveNBox content={currentRun} intialWidth={initialWidth} key={i} />));
        currentRun = [];
      }
      boxedContent.push(content[i]);
    } else  { // this is a single text
      currentRun.push(content[i]);
    }
  }
  if (currentRun.length) {
    boxedContent.push((<ResponsiveNBox content={currentRun} initialWidth={initialWidth} key={i} />));
  }
  return (<div>{boxedContent}</div>);

};
ReaderNavigationCategoryMenuContents.propTypes = {
  category:     PropTypes.string.isRequired,
  contents:     PropTypes.array.isRequired,
  categories:   PropTypes.array.isRequired,
  initialWidth: PropTypes.number,
  nestLevel:    PropTypes.number
};
ReaderNavigationCategoryMenuContents.defaultProps = {
  contents: []
};


const MenuItem = ({href, nestLevel, title, heTitle, cats, onClick, enDesc, heDesc}) => {
  const keytype  = !!cats ? "cat" : "text";
  const classes = classNames({ navBlockTitle: 1 });
  return (
    <div className="navBlock">
      <a href={href}
        className   = {classes}
        onClick     = {onClick}
        key         = {keytype + "." + nestLevel + "." + title}
      >
        <ContentText text={{en: title, he: heTitle}} />
      </a>
      {enDesc || heDesc ? 
      <div className="navBlockDescription">
        <ContentText text={{en: enDesc, he: heDesc}} />
      </div> : null }
    </div>
  );
};


const TextMenuItem = ({item, categories, nestLevel, onClick}) => {
  const [title, heTitle] = getRenderedTextTitleString(item.title, item.heTitle, categories);
  return (
    <MenuItem
      href        = {"/" + Sefaria.normRef(item.title)}
      onClick     = {onClick}
      nestLevel   = {nestLevel}
      title       = {title}
      heTitle     = {heTitle}
      enDesc      = {item.enShortDesc}
      heDesc      = {item.heShortDesc}
    />
  );
};


const TalmudToggle = ({categories, setCategories}) => {
    if ( categories.length !== 2 || categories[0] !== "Talmud") {
        return null;
    }

    const setBavli = () => { setCategories(["Talmud", "Bavli"]); };
    const setYerushalmi = () => { setCategories(["Talmud", "Yerushalmi"]); };
    const bClasses = classNames({navToggle: 1, active: categories[1] === "Bavli"});
    const yClasses = classNames({navToggle: 1, active: categories[1] === "Yerushalmi", second: 1});

    return (
      <div className="navToggles">
        <span className={bClasses} onClick={setBavli}>
          <ContentText text={{en: "Babylonian", he: "בבלי"}} />
        </span>
        <span className={yClasses} onClick={setYerushalmi}>
          <ContentText text={{en: "Jerusalem", he: "ירושלמי"}} />
        </span>
      </div>
    );
};


const ToseftaToggle = ({categories, setCategories}) => {
    if ( categories.length !== 2 || categories[0] !== "Tosefta") {
        return null;
    }

    const setVilna = () => { setCategories(["Tosefta", "Vilna Edition"]); };
    const setLieberman = () => { setCategories(["Tosefta", "Lieberman Edition"]); };
    const vClasses = classNames({navToggle: 1, active: categories[1] === "Vilna Edition"});
    const lClasses = classNames({navToggle: 1, active: categories[1] === "Lieberman Edition", second: 1});

    return (
      <div className="navToggles">
        <span className={vClasses} onClick={setVilna}>
          <ContentText text={{en: "Vilna Edition", he: "דפוס וילנא"}} />
        </span>
        <span className="navTogglesDivider">|</span>
        <span className={lClasses} onClick={setLieberman}>
          <ContentText text={{en: "Lieberman Edition", he: "מהדורת ליברמן"}} />
        </span>
      </div>
    );
};


const getRenderedTextTitleString = (title, heTitle, categories) => {
    if (title === "Pesach Haggadah") {
        return ["Pesach Haggadah Ashkenaz", "הגדה של פסח אשכנז"]
    }
    const whiteList = ['Imrei Yosher on Ruth', 'Duties of the Heart (abridged)', 'Midrash Mishlei',
        'Midrash Tehillim', 'Midrash Tanchuma', 'Midrash Aggadah', 'Pesach Haggadah Edot Hamizrah'];
    if (whiteList.indexOf(title) > -1 || categories.slice(-1)[0] === "Siddur") {
        return [title, heTitle];
    }

    const replaceTitles = {
        "en": ['Jerusalem Talmud', 'Tosefta Kifshutah'].concat(categories),
        "he": ['תלמוד ירושלמי', 'תוספתא כפשוטה'].concat(categories.map(Sefaria.hebrewTerm))
    };
    const replaceOther = {
        "en" : [", ", "; ", " on ", " to ", " of "],
        "he" : [", ", " על "]
    };

    //this will replace a category name at the beginning of the title string and any connector strings (0 or 1) that follow.
    const titleRe = new RegExp(`^(${replaceTitles['en'].join("|")})(${replaceOther['en'].join("|")})?`);
    const heTitleRe = new RegExp(`^(${replaceTitles['he'].join("|")})(${replaceOther['he'].join("|")})?`);
    title   = title === categories.slice(-1)[0] ? title : title.replace(titleRe, "");
    heTitle = heTitle === Sefaria.hebrewTerm(categories.slice(-1)[0]) ? heTitle : heTitle.replace(heTitleRe, "");

    return [title, heTitle];
};


const hebrewContentSort = (enCats) => {
    // Sorts contents of this category by Hebrew Alphabetical
    //console.log(cats);
    const heCats = enCats.slice().map(function(item, indx) {
      item.enOrder = indx;
      return item;
    });

    // If all of the cats have a base_text_order, don't re-sort.
    if (heCats.every(c => !!c.base_text_order))   {
        return heCats;
    }
    heCats.sort(function(a, b) {
      if ("order" in a || "order" in b) {
        const aOrder = "order" in a ? a.order : 9999;
        const bOrder = "order" in b ? b.order : 9999;
        return aOrder > bOrder ? 1 : -1;

      } else if (("category" in a) !== ("category" in b)) {
        return a.enOrder > b.enOrder ? 1 : -1;

      //} else if (a.heComplete !== b.heComplete) {
      //  return a.heComplete ? -1 : 1;

      } else if (a.heTitle && b.heTitle) {
        return a.heTitle > b.heTitle ? 1 : -1;

      }
      return a.enOrder > b.enOrder ? 1 : -1;
    });
    //console.log(heCats)
    return heCats;
};


const getSidebarModules = (categories) => {
  const path = categories.join("|");

  const modules = {
    "Tanakh": [
      {type: "WeeklyTorahPortion"},
    ],
    "Talmud|Bavli": [
      {type: "DafYomi"},
    ]
  };

  const customModules = path in modules ? modules[path] : [];

  const defaultModules = [
    {type: "Visualizations", props: {categories}},
    {type: "SupportSefaria"},
  ]; 

  return customModules.concat(defaultModules);
};


export default ReaderNavigationCategoryMenu;
