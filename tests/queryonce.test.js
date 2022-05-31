const Ofn = require( 'oro-functions' );
const { OMysql } = require( '../index' );

//

const CONFIG = Ofn.getFileJsonRecursivelySync( `${__dirname}/config.json` );

beforeAll(async () => {
    let oMysql = new OMysql( { settings: CONFIG } );
    await oMysql.poolOpen();
    await oMysql.query( "CREATE DATABASE IF NOT EXISTS test_oromysql" );
    await oMysql.query( "USE test_oromysql" );
    await oMysql.query(
        `CREATE TABLE IF NOT EXISTS test_once ( \
                     id INT NOT NULL AUTO_INCREMENT, \
                     name VARCHAR (16) NOT NULL, \
                PRIMARY KEY ( id ), UNIQUE test_once_name ( name ) ) ENGINE = InnoDB;` );
    await oMysql.query( `INSERT INTO test_once ( name ) VALUES ( 'chacho' )` );
    await oMysql.poolClose();
});

afterAll(async () => {
    let oMysql = new OMysql( { settings: CONFIG } );
    await oMysql.poolOpen();
    await oMysql.query( "USE test_oromysql" );
    await oMysql.query( "DROP TABLE IF EXISTS test_once" );
    await oMysql.poolClose();
});

describe('queryOnce SELECT', () => {
    test( 'queryOnce SELECT bad settings', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysqll' } );
        const oMysql = new OMysql( { settings } );

        let response = await oMysql.queryOnce( `SELECT * FROM test_once`, 'row' );

        expect( response.status ).toBe( false );
        expect( response.error.msg ).toBe( "Error: Unknown database 'test_oromysqll'" );
    } );

    test( 'queryOnce SELECT bad query', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        let response = await oMysql.queryOnce( `SELECT * FROMM test_once`, 'row' );

        expect( response.status ).toBe( false );
        expect( response.error.msg ).toMatch( /(Error: You have an error in your SQL syntax;)/ );
    } );

    test( 'queryOnce SELECT bad query', async () => {
        let settings = Object.assign( {}, CONFIG, { database: 'test_oromysql' } );
        const oMysql = new OMysql( { settings } );

        let response = await oMysql.queryOnce( `SELECT * FROM test_once`, 'row' );

        expect( response.status ).toBe( true );
        expect( response.result ).toEqual( { id: 1, name: 'chacho' } );
    } );
});